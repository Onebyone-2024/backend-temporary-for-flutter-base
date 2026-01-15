import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  Body,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { JobsService } from './jobs.service';
import { CreateJobDto } from './dto/create-job.dto';
import { StartJobDto } from './dto/start-job.dto';
import { FinishJobDto } from './dto/finish-job.dto';

@ApiTags('Jobs')
@Controller('jobs')
export class JobsController {
  constructor(private jobsService: JobsService) {}

  @Post()
  @ApiOperation({
    summary: 'Create a new job with pickup and delivery details',
  })
  @ApiResponse({ status: 201, description: 'Job created successfully' })
  async createJob(@Body() createJobDto: CreateJobDto) {
    return await this.jobsService.createJob(createJobDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all jobs (excluding deleted ones)' })
  @ApiResponse({ status: 200, description: 'Jobs retrieved successfully' })
  async getAllJobs() {
    return await this.jobsService.getAllJobs();
  }

  @Get(':jobUuid')
  @ApiOperation({
    summary:
      'Get job details (from Redis cache if available, otherwise from database)',
  })
  @ApiResponse({
    status: 200,
    description: 'Job details retrieved successfully',
  })
  async getJobDetails(@Param('jobUuid') jobUuid: string) {
    return await this.jobsService.getJobDetails(jobUuid);
  }

  @Delete(':jobUuid')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary:
      'Soft delete a job (change status to deleted and remove from cache)',
  })
  @ApiResponse({ status: 200, description: 'Job deleted successfully' })
  async deleteJob(@Param('jobUuid') jobUuid: string) {
    return await this.jobsService.deleteJob(jobUuid);
  }

  @Post(':jobUuid/start')
  @ApiOperation({
    summary:
      'Start a job (change status to in_progress, cache details, store current location)',
  })
  @ApiResponse({ status: 200, description: 'Job started successfully' })
  async startJob(
    @Param('jobUuid') jobUuid: string,
    @Body() startJobDto: Omit<StartJobDto, 'jobUuid'>,
  ) {
    return await this.jobsService.startJob({ jobUuid, ...startJobDto });
  }

  @Post(':jobUuid/finish')
  @ApiOperation({
    summary:
      'Finish a job (change status to finished, record ATA, calculate actual duration)',
  })
  @ApiResponse({ status: 200, description: 'Job finished successfully' })
  async finishJob(
    @Param('jobUuid') jobUuid: string,
    @Body() finishJobDto: FinishJobDto,
  ) {
    return await this.jobsService.finishJob(jobUuid, finishJobDto);
  }
}
