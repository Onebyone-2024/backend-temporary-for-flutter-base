import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { PushLocationDto } from './dto/push-location.dto';

@Injectable()
export class TrackingService {
  constructor(
    private prisma: PrismaService,
    private redis: RedisService,
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
    await this.redis.setJson(locationKey, { lat, lng, timestamp: new Date() });

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
