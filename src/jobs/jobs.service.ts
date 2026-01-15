import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { CreateJobDto } from './dto/create-job.dto';
import { StartJobDto } from './dto/start-job.dto';
import { FinishJobDto } from './dto/finish-job.dto';

@Injectable()
export class JobsService {
  constructor(
    private prisma: PrismaService,
    private redis: RedisService,
  ) {}

  /**
   * Generate unique job code
   * Format: JOB-YYYYMMDD-XXXXX (e.g., JOB-20260114-00001)
   */
  private async generateJobCode(): Promise<string> {
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');

    // Get the count of jobs created today
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const jobsCount = await this.prisma.job.count({
      where: {
        createdAt: {
          gte: todayStart,
          lte: todayEnd,
        },
      },
    });

    const sequenceNumber = String(jobsCount + 1).padStart(5, '0');
    return `JOB-${dateStr}-${sequenceNumber}`;
  }

  async createJob(createJobDto: CreateJobDto) {
    // Generate job code automatically
    const jobCode = await this.generateJobCode();

    // If assignedTo is provided, validate that user exists
    if (createJobDto.assignedTo) {
      const user = await this.prisma.user.findUnique({
        where: { uuid: createJobDto.assignedTo },
      });

      if (!user) {
        throw new BadRequestException(
          `User with UUID ${createJobDto.assignedTo} does not exist`,
        );
      }
    }

    try {
      // Create job with pickup and delivery in a transaction
      const job = await this.prisma.job.create({
        data: {
          jobCode,
          jobStatus: 'planned',
          description: createJobDto.description,
          assignedTo: createJobDto.assignedTo || null,
          pickup: {
            create: {
              address: createJobDto.pickup.address,
              lat: createJobDto.pickup.lat,
              lng: createJobDto.pickup.lng,
            },
          },
          delivery: {
            create: {
              address: createJobDto.delivery.address,
              lat: createJobDto.delivery.lat,
              lng: createJobDto.delivery.lng,
              polyline: createJobDto.delivery.polyline,
              distanceKm: createJobDto.delivery.distanceKm,
              eta: new Date(createJobDto.delivery.eta),
              etd: new Date(createJobDto.delivery.etd),
              estimateDuration: createJobDto.delivery.estimateDuration,
            },
          },
        },
        include: {
          pickup: true,
          delivery: true,
        },
      });

      return {
        message: 'Job created successfully',
        data: job,
      };
    } catch (error) {
      if (error.code === 'P2003') {
        throw new BadRequestException(
          'Invalid user reference for assignedTo field',
        );
      }
      throw error;
    }
  }

  async getAllJobs() {
    const jobs = await this.prisma.job.findMany({
      where: {
        jobStatus: { not: 'deleted' },
      },
      include: {
        pickup: true,
        delivery: true,
        assignee: {
          select: {
            uuid: true,
            fullName: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return {
      data: jobs,
      total: jobs.length,
    };
  }

  async getJobDetails(jobUuid: string) {
    // Try to get from Redis first
    const cacheKey = `details_${jobUuid}`;
    const cached = await this.redis.getJson(cacheKey);

    if (cached) {
      return {
        data: cached,
        source: 'cache',
      };
    }

    // If not in cache, get from database
    const job = await this.prisma.job.findUnique({
      where: { uuid: jobUuid },
      include: {
        pickup: true,
        delivery: true,
        assignee: {
          select: {
            uuid: true,
            fullName: true,
            email: true,
          },
        },
      },
    });

    if (!job) {
      throw new NotFoundException('Job not found');
    }

    // Store in Redis for future requests
    await this.redis.setJson(cacheKey, job);

    return {
      data: job,
      source: 'database',
    };
  }

  async deleteJob(jobUuid: string) {
    const job = await this.prisma.job.findUnique({
      where: { uuid: jobUuid },
    });

    if (!job) {
      throw new NotFoundException('Job not found');
    }

    // Update job status to deleted
    const updatedJob = await this.prisma.job.update({
      where: { uuid: jobUuid },
      data: { jobStatus: 'deleted' },
    });

    // Remove from Redis cache
    await this.redis.del(`details_${jobUuid}`);

    return {
      message: 'Job deleted successfully',
      data: updatedJob,
    };
  }

  async startJob(startJobDto: StartJobDto) {
    const { jobUuid, lat, lng } = startJobDto;

    // Check if job exists
    const job = await this.prisma.job.findUnique({
      where: { uuid: jobUuid },
      include: {
        pickup: true,
        delivery: true,
      },
    });

    if (!job) {
      throw new NotFoundException('Job not found');
    }

    // Change job status to in_progress and set ATD to current date
    const updatedJob = await this.prisma.job.update({
      where: { uuid: jobUuid },
      data: {
        jobStatus: 'in_progress',
        delivery: {
          update: {
            atd: new Date(), // Automatically set to current date/time
          },
        },
      },
      include: {
        pickup: true,
        delivery: true,
      },
    });

    // Store job details in Redis
    const detailsKey = `details_${jobUuid}`;
    await this.redis.setJson(detailsKey, updatedJob);

    // Store current location in Redis
    const locationKey = `currentLoc_${jobUuid}`;
    await this.redis.setJson(locationKey, { lat, lng });

    return {
      message: 'Job started successfully',
      data: updatedJob,
    };
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async finishJob(jobUuid: string, finishJobDto: FinishJobDto) {
    // Check if job exists
    const job = await this.prisma.job.findUnique({
      where: { uuid: jobUuid },
      include: {
        delivery: true,
      },
    });

    if (!job) {
      throw new NotFoundException('Job not found');
    }

    // Set ATA to current date/time automatically
    const ata = new Date();

    // Calculate actual duration (ATA - ATD in minutes)
    const atd = job.delivery?.atd;
    let actualDuration: number | null = null;

    if (atd) {
      const durationMs = ata.getTime() - atd.getTime();
      actualDuration = Math.floor(durationMs / (1000 * 60)); // Convert to minutes
    }

    // Update job with finished status and delivery details
    const updatedJob = await this.prisma.job.update({
      where: { uuid: jobUuid },
      data: {
        jobStatus: 'finished',
        delivery: {
          update: {
            ata,
            actualDuration,
          },
        },
      },
      include: {
        pickup: true,
        delivery: true,
        assignee: {
          select: {
            uuid: true,
            fullName: true,
            email: true,
          },
        },
      },
    });

    // Remove current location from Redis cache
    const locationKey = `currentLoc_${jobUuid}`;
    await this.redis.del(locationKey);

    // Remove job details from Redis cache
    const detailsKey = `details_${jobUuid}`;
    await this.redis.del(detailsKey);

    return {
      message: 'Job finished successfully',
      data: updatedJob,
    };
  }
}
