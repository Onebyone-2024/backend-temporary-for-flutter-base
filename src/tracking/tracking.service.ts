import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { TrackingGateway } from './tracking.gateway';
import { PushLocationDto } from './dto/push-location.dto';

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

    // Update current location in Redis
    const locationKey = `currentLoc_${jobUuid}`;
    const locationData = { lat, lng, polyline, timestamp };
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
      data: { jobUuid, lat, lng, polyline, timestamp },
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
    },
  ) {
    // Broadcast to all clients subscribed to this job
    if (this.gateway.server) {
      const roomName = `tracking_${jobId}`;
      this.gateway.server.to(roomName).emit('location_update', {
        jobId,
        location: locationData,
      });
      this.logger.log(`📡 Broadcast location update to room: ${roomName}`);
    } else {
      this.logger.warn('WebSocket server not available for broadcasting');
    }

    return {
      success: true,
      message: 'Location broadcasted successfully',
    };
  }
}
