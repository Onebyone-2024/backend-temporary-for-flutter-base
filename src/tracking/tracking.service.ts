import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { TrackingGateway } from './tracking.gateway';
import { PushLocationDto } from './dto/push-location.dto';
import { calculateLocationTracking } from './utils/distance.calculator';

@Injectable()
export class TrackingService {
  private readonly logger = new Logger(TrackingService.name);

  constructor(
    private prisma: PrismaService,
    private redis: RedisService,
    private gateway: TrackingGateway,
  ) {}

  async pushLocation(pushLocationDto: PushLocationDto) {
    const { jobUuid, lat, lng, polyline: newPolyline } = pushLocationDto;

    // Get polyline from job details in Redis
    let polyline: string | null = null;
    const detailsKey = `details_${jobUuid}`;
    const cachedJob: any = await this.redis.getJson(detailsKey);

    if (cachedJob && cachedJob.delivery && cachedJob.delivery.polyline) {
      polyline = cachedJob.delivery.polyline;
    }

    // If new polyline provided (reroute scenario), update DB and Redis
    if (newPolyline) {
      this.logger.log(`🔄 Polyline update detected for job: ${jobUuid}`);

      // Update polyline in database
      await this.prisma.delivery.updateMany({
        where: { jobUuid },
        data: { polyline: newPolyline },
      });

      // Update polyline in cached job details
      if (cachedJob && cachedJob.delivery) {
        cachedJob.delivery.polyline = newPolyline;
        await this.redis.setJson(detailsKey, cachedJob);
      }

      // Use new polyline
      polyline = newPolyline;

      this.logger.log(`✓ Polyline updated in DB and Redis for job: ${jobUuid}`);
    }

    // Create timestamp once
    const timestamp = new Date().toISOString();

    // Initialize location data
    const locationData: any = { lat, lng, polyline, timestamp };

    // Calculate duration estimation and remaining distance if polyline exists

    this.logger.log(`📡 Test : ${cachedJob}`);
    if (polyline && cachedJob && cachedJob.delivery) {
      try {
        const { remainingDistanceKm, durationEstimation } =
          calculateLocationTracking(
            lat,
            lng,
            polyline,
            cachedJob.delivery.distanceKm || 0,
            cachedJob.delivery.estimateDuration || 0,
          );

        locationData.remaining_distance_km = remainingDistanceKm;
        locationData.duration_estimation = durationEstimation;

        this.logger.log(
          `📊 Tracking calc: remaining=${remainingDistanceKm}km, eta=${durationEstimation}min for job: ${jobUuid}`,
        );
      } catch (error) {
        this.logger.warn(
          `⚠️  Failed to calculate tracking data for job ${jobUuid}: ${error instanceof Error ? error.message : String(error)}`,
        );
        // Continue without calculation if it fails
      }
    } else {
      this.logger.warn(
        `⚠️  Cannot calculate tracking: polyline=${!!polyline}, cachedJob=${!!cachedJob}`,
      );
    }

    // Update current location in Redis
    const locationKey = `currentLoc_${jobUuid}`;
    await this.redis.setJson(locationKey, locationData);

    // Broadcast to all clients subscribed to this job
    if (this.gateway.server) {
      const roomName = `tracking_${jobUuid}`;
      this.gateway.server.to(roomName).emit('location_update', {
        jobId: jobUuid,
        location: locationData,
      });
      this.logger.log(`📡 Broadcast location update to room: ${roomName}`);
    } else {
      this.logger.warn('WebSocket server not available for broadcasting');
    }

    return {
      message: 'Location updated successfully',
      data: locationData,
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
