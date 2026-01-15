import { Controller, Post, Get, Param, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { TrackingService } from './tracking.service';
import { PushLocationDto } from './dto/push-location.dto';

@ApiTags('Tracking')
@Controller('tracking')
export class TrackingController {
  constructor(private trackingService: TrackingService) {}

  @Post('push-location')
  @ApiOperation({
    summary: 'Push current location (updates Redis location key)',
  })
  @ApiResponse({ status: 200, description: 'Location pushed successfully' })
  async pushLocation(@Body() pushLocationDto: PushLocationDto) {
    return await this.trackingService.pushLocation(pushLocationDto);
  }

  @Get(':jobUuid/location')
  @ApiOperation({
    summary: 'Get current location of a job (from Redis)',
  })
  @ApiResponse({ status: 200, description: 'Current location retrieved' })
  async getCurrentLocation(@Param('jobUuid') jobUuid: string) {
    return await this.trackingService.getCurrentLocation(jobUuid);
  }
}
