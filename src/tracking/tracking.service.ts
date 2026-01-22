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
    const { jobUuid, lat, lng, polyline: newPolyline } = pushLocationDto;

    // STEP 1: Get job details from Redis
    const detailsKey = `details_${jobUuid}`;
    const cachedJob: any = await this.redis.getJson(detailsKey);

    if (!cachedJob || !cachedJob.delivery) {
      throw new Error(`Job details not found for job: ${jobUuid}`);
    }

    let currentPolyline = cachedJob.delivery.polyline;
    let polylineLog: PolylineLogEntry[] = cachedJob.delivery.polylineLog || [];
    let rerouted = false;
    let offRouteDistance = 0;
    let isOffRouteDetected = false;

    const timestamp = new Date().toISOString();

    // ========== AUTO OFF-ROUTE DETECTION (BACKEND) ==========
    // Backend automatically checks if driver is off-route WITHOUT needing FE flag
    if (currentPolyline) {
      const offRouteCheck = isOffRoute(lat, lng, currentPolyline, 50);
      offRouteDistance = offRouteCheck.distanceFromPolyline;

      if (offRouteCheck.isOffRoute) {
        isOffRouteDetected = true;
        this.logger.warn(
          `🚨 OFF-ROUTE DETECTED! Distance from polyline: ${offRouteDistance.toFixed(0)}m (job: ${jobUuid})`,
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
            // SAVE OLD POLYLINE FIRST before requesting new one
            polylineLog.unshift({
              polyline: currentPolyline,
              timestamp,
              reason: 'off_route',
              distanceFromPreviousRoute: offRouteDistance,
            });

            // Keep max 10 entries in log
            if (polylineLog.length > 10) polylineLog.pop();

            // Hit Google API for new route
            const newRoute = await this.mapsService.getReroute(
              lat,
              lng,
              cachedJob.delivery.lat,
              cachedJob.delivery.lng,
            );

            // ADD NEW POLYLINE to log
            polylineLog.unshift({
              polyline: newRoute.polyline,
              timestamp,
              reason: 'reroute_new',
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
    // ========== EXPLICIT POLYLINE UPDATE ==========
    // When FE explicitly provides new polyline (e.g., from user action)
    if (newPolyline && newPolyline !== currentPolyline) {
      this.logger.log(`🔄 Explicit polyline update for job: ${jobUuid}`);

      // SAVE OLD POLYLINE FIRST
      polylineLog.unshift({
        polyline: currentPolyline,
        timestamp,
        reason: 'manual_reroute',
      });

      // Then ADD NEW POLYLINE
      polylineLog.unshift({
        polyline: newPolyline,
        timestamp,
        reason: 'manual_reroute_new',
      });

      // Keep max 10 entries in log
      if (polylineLog.length > 10) polylineLog.pop();

      // Update current polyline
      currentPolyline = newPolyline;
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

    if (isOffRouteDetected) {
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
        offRoute: isOffRouteDetected,
        rerouted,
        polylineUpdated: rerouted || !!newPolyline,
      });
      this.logger.log(`📡 Broadcast location update to room: ${roomName}`);
    } else {
      this.logger.warn('WebSocket server not available for broadcasting');
    }

    return {
      message: 'Location updated successfully',
      data: locationData,
      offRoute: isOffRouteDetected,
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
