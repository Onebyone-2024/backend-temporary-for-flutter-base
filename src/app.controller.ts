import {
  Controller,
  Get,
  Query,
  BadRequestException,
  Res,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AppService } from './app.service';
import { Response } from 'express';
import * as path from 'path';

@ApiTags('Health')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({ summary: 'Welcome message' })
  @ApiResponse({ status: 200, description: 'Welcome message returned' })
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('health')
  @ApiOperation({ summary: 'Health check including Redis connection status' })
  @ApiResponse({ status: 200, description: 'Health status returned' })
  healthCheck() {
    return this.appService.getHealth();
  }

  @Get('redis-value')
  @ApiOperation({ summary: 'Check Redis value by key' })
  @ApiResponse({ status: 200, description: 'Redis value returned' })
  @ApiResponse({ status: 400, description: 'Key parameter is required' })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - JWT token required',
  })
  async getRedisValue(@Query('key') key: string) {
    if (!key) {
      throw new BadRequestException('Key parameter is required');
    }

    return this.appService.getRedisValue(key);
  }

  @Get('redis-all')
  @ApiOperation({ summary: 'Get all Redis keys and values' })
  @ApiResponse({
    status: 200,
    description: 'All Redis keys and values returned',
  })
  async getAllRedisKeysAndValues() {
    return this.appService.getAllRedisKeysAndValues();
  }

  @Get('socket')
  @ApiOperation({ summary: 'WebSocket test client' })
  @ApiResponse({ status: 200, description: 'WebSocket test HTML page' })
  socket(@Res() res: Response) {
    const filePath = path.join(__dirname, '..', 'public', 'socket.html');
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.sendFile(filePath);
  }
}
