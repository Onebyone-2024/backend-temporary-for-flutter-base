import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { RedisModule } from './redis/redis.module';
import { JobsModule } from './jobs/jobs.module';
import { TrackingModule } from './tracking/tracking.module';
import { SimulationModule } from './simulation/simulation.module';

@Module({
  imports: [
    // Configuration Module
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // Serve static files (websocket-test.html, etc)
    // Files in src/public are compiled to dist/src/public
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, 'public'),
      exclude: [
        '/api/*',
        '/health',
        '/redis-*',
        '/jobs/*',
        '/tracking/*',
        '/auth/*',
      ],
    }),

    // Prisma Module (Global)
    PrismaModule,

    // Redis Module
    RedisModule,

    // Feature Modules
    AuthModule,
    JobsModule,
    TrackingModule, // Includes WebSocket Gateway
    SimulationModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
