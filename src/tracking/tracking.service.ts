import { Injectable, NotFoundException, Logger } from '@nestjs/common';
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
    const { jobUuid, lat, lng } = pushLocationDto;

    // Check if job exists
    const job = await this.prisma.job.findUnique({
      where: { uuid: jobUuid },
    });

    if (!job) {
      throw new NotFoundException('Job not found');
    }

    // Update current location in Redis
    const locationKey = `currentLoc_${jobUuid}`;
    const locationData = { lat, lng, timestamp: new Date() };
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
      data: { jobUuid, lat, lng, timestamp: new Date() },
    };
  }

  async getCurrentLocation(jobUuid: string) {
    // Check if job exists
    const job = await this.prisma.job.findUnique({
      where: { uuid: jobUuid },
    });

    if (!job) {
      throw new NotFoundException('Job not found');
    }

    const locationKey = `currentLoc_${jobUuid}`;
    const location = await this.redis.getJson(locationKey);

    return {
      data: location,
    };
  }
}
