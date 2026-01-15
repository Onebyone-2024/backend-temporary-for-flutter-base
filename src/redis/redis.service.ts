import {
  Injectable,
  Logger,
  OnModuleInit,
  OnModuleDestroy,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, RedisClientType } from 'redis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private client: RedisClientType;
  private readonly logger = new Logger(RedisService.name);

  constructor(private configService: ConfigService) {}

  async onModuleInit() {
    const host = this.configService.get<string>('REDIS_HOST', 'localhost');
    const port = this.configService.get<number>('REDIS_PORT', 6379);
    const password = this.configService.get<string>('REDIS_PASSWORD');

    this.client = createClient({
      socket: {
        host,
        port,
      },
      ...(password && { password }),
    });

    this.client.on('error', (err) => {
      this.logger.error('Redis Client Error', err);
    });

    this.client.on('connect', () => {
      this.logger.log(`✓ Redis connected to ${host}:${port}`);
    });

    try {
      await this.client.connect();
      this.logger.log('Redis connection established successfully');
    } catch (error) {
      this.logger.error('Failed to connect to Redis', error);
      throw error;
    }
  }

  async onModuleDestroy() {
    if (this.client) {
      await this.client.disconnect();
      this.logger.log('Redis disconnected');
    }
  }

  isConnected(): boolean {
    return this.client?.isOpen ?? false;
  }

  async get(key: string): Promise<string | null> {
    return await this.client.get(key);
  }

  async set(key: string, value: string, ttl?: number): Promise<void> {
    if (ttl) {
      await this.client.setEx(key, ttl, value);
    } else {
      await this.client.set(key, value);
    }
  }

  async del(key: string): Promise<number> {
    return await this.client.del(key);
  }

  async exists(key: string): Promise<boolean> {
    return (await this.client.exists(key)) === 1;
  }

  async getJson<T>(key: string): Promise<T | null> {
    const data = await this.get(key);
    return data ? JSON.parse(data) : null;
  }

  async setJson<T>(key: string, value: T, ttl?: number): Promise<void> {
    await this.set(key, JSON.stringify(value), ttl);
  }

  async getAllKeysAndValues(): Promise<{ key: string; value: string }[]> {
    const keys = await this.client.keys('*');
    const result: { key: string; value: string }[] = [];

    for (const key of keys) {
      const value = await this.get(key);
      if (value !== null) {
        result.push({ key, value });
      }
    }

    return result;
  }
}
