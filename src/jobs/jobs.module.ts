import { Module } from '@nestjs/common';
import { JobsService } from './jobs.service';
import { JobsController } from './jobs.controller';
import { RedisModule } from '../redis/redis.module';
import { TrackingModule } from '../tracking/tracking.module';

@Module({
  imports: [RedisModule, TrackingModule],
  controllers: [JobsController],
  providers: [JobsService],
})
export class JobsModule {}
