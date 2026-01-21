import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { TrackingGateway } from './tracking.gateway';
import { PushLocationDto, PolylineLogEntry } from './dto/push-location.dto';
import { calculateLocationTracking } from './utils/distance.calculator';
import { isOffRoute } from './utils/polyline.decoder';
import { MapsService } from '../maps/maps.service';

@Injectable()
export class TrackingService {
  private readonly logger = new Logger(TrackingService.name);

  constructor(
    private prisma: PrismaService,
    private redis: RedisService,
    private gateway: TrackingGateway,
    private mapsService: MapsService,
  ) {}

  async pushLocation(pushLocationDto: PushLocationDto) {
    const {
      jobUuid,
      lat,
      lng,
      polyline: newPolyline,
      isOffRoute: isOffRouteFlag,
    } = pushLocationDto;

    // STEP 1: Get job details from Redis
    const detailsKey = `details_${jobUuid}`;
    const cachedJob: any = await this.redis.getJson(detailsKey);

    if (!cachedJob || !cachedJob.delivery) {
      throw new Error(`Job details not found for job: ${jobUuid}`);
    }

    let currentPolyline = cachedJob.delivery.polyline;
    const polylineLog: PolylineLogEntry[] =
      cachedJob.delivery.polylineLog || [];
    let rerouted = false;
    let offRouteDistance = 0;

    const timestamp = new Date().toISOString();

    // ========== NEGATIVE FLOW: OFF-ROUTE DETECTION ==========
    if (isOffRouteFlag && currentPolyline) {
      this.logger.warn(`🚨 OFF-ROUTE FLAG received for job: ${jobUuid}`);

      // STEP 2: Check distance to polyline (LOCAL - NO API)
      const offRouteCheck = isOffRoute(lat, lng, currentPolyline, 100);
      offRouteDistance = offRouteCheck.distanceFromPolyline;

      this.logger.log(
        `📍 Distance from polyline: ${offRouteCheck.distanceFromPolyline.toFixed(0)}m`,
      );

      // STEP 3: If truly off-route, hit Google API for new route
      if (offRouteCheck.isOffRoute) {
        this.logger.warn(
          `⚠️ Driver off-route! Distance: ${offRouteCheck.distanceFromPolyline.toFixed(0)}m`,
        );

        try {
          // Check throttling (max 1 reroute per minute)
          const lastRerouteKey = `lastReroute_${jobUuid}`;
          const lastReroute = await this.redis.get(lastRerouteKey);

          const now = Date.now();
          const timeSinceLastReroute = lastReroute
            ? now - parseInt(lastReroute)
            : null;

          if (timeSinceLastReroute && timeSinceLastReroute < 60000) {
            this.logger.log(
              `⏱️ Reroute throttled (${(timeSinceLastReroute / 1000).toFixed(1)}s since last reroute)`,
            );
          } else {
            // Hit Google API for new route
            const newRoute = await this.mapsService.getReroute(
              lat,
              lng,
              cachedJob.delivery.lat,
              cachedJob.delivery.lng,
            );

            // STEP 4: Log history with new polyline
            polylineLog.unshift({
              polyline: newRoute.polyline,
              timestamp,
              reason: 'off_route',
              distanceFromPreviousRoute: offRouteCheck.distanceFromPolyline,
            });

            // Keep max 10 entries in log
            if (polylineLog.length > 10) polylineLog.pop();

            // Update current polyline & metadata
            currentPolyline = newRoute.polyline;
            cachedJob.delivery.polyline = newRoute.polyline;
            cachedJob.delivery.polylineLog = polylineLog;
            cachedJob.delivery.distanceKm = newRoute.distance;
            cachedJob.delivery.estimateDuration = newRoute.duration;

            // STEP 5: Update Redis
            await this.redis.setJson(detailsKey, cachedJob);
            await this.redis.set(lastRerouteKey, now.toString());

            // Also update database for persistence
            await this.prisma.delivery.updateMany({
              where: { jobUuid },
              data: {
                polyline: newRoute.polyline,
              },
            });

            rerouted = true;

            this.logger.log(
              `✓ Rerouted! New distance: ${newRoute.distance}km, duration: ${newRoute.duration}min`,
            );
          }
        } catch (error) {
          this.logger.error(
            `❌ Reroute failed: ${error instanceof Error ? error.message : String(error)}`,
          );
          // Continue with old polyline if API fails
        }
      }
    }
    // ========== NORMAL FLOW: Explicit polyline update ==========
    else if (newPolyline && !isOffRouteFlag) {
      this.logger.log(`🔄 Explicit polyline update for job: ${jobUuid}`);

      currentPolyline = newPolyline;

      // Log history
      polylineLog.unshift({
        polyline: newPolyline,
        timestamp,
        reason: 'reroute',
      });

      if (polylineLog.length > 10) polylineLog.pop();

      // Update cache and database
      cachedJob.delivery.polyline = newPolyline;
      cachedJob.delivery.polylineLog = polylineLog;
      await this.redis.setJson(detailsKey, cachedJob);

      await this.prisma.delivery.updateMany({
        where: { jobUuid },
        data: { polyline: newPolyline },
      });

      this.logger.log(`✓ Polyline updated via explicit request`);
    }

    // STEP 6: Calculate distance & duration with current polyline
    const locationData: any = {
      lat,
      lng,
      polyline: currentPolyline,
      polylineLog,
      timestamp,
      rerouted,
    };

    if (isOffRouteFlag) {
      locationData.distanceFromRoute = offRouteDistance;
    }

    if (currentPolyline && cachedJob.delivery) {
      try {
        const { remainingDistanceKm, durationEstimation } =
          calculateLocationTracking(
            lat,
            lng,
            currentPolyline,
            cachedJob.delivery.distanceKm || 0,
            cachedJob.delivery.estimateDuration || 0,
          );

        locationData.remaining_distance_km = remainingDistanceKm;
        locationData.duration_estimation = durationEstimation;

        this.logger.log(
          `📊 Tracking calc: remaining=${remainingDistanceKm}km, eta=${durationEstimation}min`,
        );
      } catch (error) {
        this.logger.warn(
          `⚠️ Failed to calculate tracking: ${error instanceof Error ? error.message : String(error)}`,
        );
      }
    }

    // STEP 7: Update Redis currentLoc
    const locationKey = `currentLoc_${jobUuid}`;
    await this.redis.setJson(locationKey, locationData);

    // STEP 8: Broadcast to WebSocket
    if (this.gateway.server) {
      const roomName = `tracking_${jobUuid}`;
      this.gateway.server.to(roomName).emit('location_update', {
        jobId: jobUuid,
        location: locationData,
        offRoute: isOffRouteFlag,
        polylineUpdated: rerouted || !!newPolyline,
      });
      this.logger.log(`📡 Broadcast location update to room: ${roomName}`);
    } else {
      this.logger.warn('WebSocket server not available for broadcasting');
    }

    return {
      message: 'Location updated successfully',
      data: locationData,
      offRoute: isOffRouteFlag,
      rerouted,
    };
  }

  async getCurrentLocation(jobUuid: string) {
    const locationKey = `currentLoc_${jobUuid}`;
    const location: any = await this.redis.getJson(locationKey);

    // If location doesn't have polyline, get it from job details in Redis
    if (location && !location.polyline) {
      const detailsKey = `details_${jobUuid}`;
      const jobDetails: any = await this.redis.getJson(detailsKey);

      if (jobDetails && jobDetails.delivery && jobDetails.delivery.polyline) {
        location.polyline = jobDetails.delivery.polyline;
      } else {
        location.polyline = 'Noooo';
      }
    }

    return {
      data: location,
    };
  }

  async pushLocationToSocket(
    jobId: string,
    locationData: {
      lat: number;
      lng: number;
      timestamp: string;
      polyline: string;
      remaining_distance_km?: number;
      duration_estimation?: number;
    },
  ) {
    // Get job cache to calculate if needed
    const detailsKey = `details_${jobId}`;
    const cachedJob: any = await this.redis.getJson(detailsKey);

    // Calculate duration estimation and remaining distance if polyline exists and no calculation yet
    if (
      locationData.polyline &&
      !locationData.remaining_distance_km &&
      !locationData.duration_estimation &&
      cachedJob &&
      cachedJob.delivery
    ) {
      try {
        const { remainingDistanceKm, durationEstimation } =
          calculateLocationTracking(
            locationData.lat,
            locationData.lng,
            locationData.polyline,
            cachedJob.delivery.distanceKm || 0,
            cachedJob.delivery.estimateDuration || 0,
          );

        locationData.remaining_distance_km = remainingDistanceKm;
        locationData.duration_estimation = durationEstimation;

        this.logger.log(
          `📊 Tracking calc: remaining=${remainingDistanceKm}km, eta=${durationEstimation}min for job: ${jobId}`,
        );
      } catch (error) {
        this.logger.warn(
          `⚠️  Failed to calculate tracking data for job ${jobId}: ${error instanceof Error ? error.message : String(error)}`,
        );
      }
    }

    // Check if driver arrived at destination (duration ≤ 1 minute)
    const hasArrived =
      locationData.duration_estimation !== undefined &&
      locationData.duration_estimation <= 1;

    if (hasArrived) {
      this.logger.log(
        `🎯 [${jobId}] Driver arrived at destination! duration=${locationData.duration_estimation}min`,
      );

      // Set duration to 0 to indicate arrival
      locationData.duration_estimation = 0;
      locationData.remaining_distance_km = 0;
    }

    // Update currentLoc in Redis
    const locationKey = `currentLoc_${jobId}`;
    await this.redis.setJson(locationKey, locationData);

    // Broadcast to all clients subscribed to this job
    if (this.gateway.server) {
      const roomName = `tracking_${jobId}`;
      this.gateway.server.to(roomName).emit('location_update', {
        jobId,
        location: locationData,
        arrived: hasArrived,
      });
      this.logger.log(`📡 Broadcast location update to room: ${roomName}`);
    } else {
      this.logger.warn('WebSocket server not available for broadcasting');
    }

    return {
      success: true,
      message: 'Location broadcasted successfully',
      arrived: hasArrived,
    };
  }
}
