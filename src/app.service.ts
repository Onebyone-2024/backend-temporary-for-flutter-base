import { Injectable, NotFoundException } from '@nestjs/common';
import { RedisService } from './redis/redis.service';

@Injectable()
export class AppService {
  constructor(private redisService: RedisService) {}

  getHello(): string {
    return 'Welcome to Job Tracking Backend API!';
  }

  getHealth() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      redis: this.redisService.isConnected() ? 'connected' : 'disconnected',
    };
  }

  /**
   * Attempt to deserialize value if it's a JSON string
   */
  public deserializeValue(value: string): unknown {
    try {
      return JSON.parse(value);
    } catch {
      // Return as-is if not valid JSON
      return value;
    }
  }

  async getRedisValue(key: string) {
    const value = await this.redisService.get(key);

    if (value === null) {
      throw new NotFoundException(`Redis key "${key}" not found`);
    }

    const deserializedValue = this.deserializeValue(value);

    return {
      key,
      value: deserializedValue,
      type: typeof deserializedValue,
      isJson: typeof deserializedValue === 'object',
    };
  }

  async getAllRedisKeysAndValues() {
    const data = await this.redisService.getAllKeysAndValues();

    const deserializedData = data.map((item) => ({
      key: item.key,
      value: this.deserializeValue(item.value),
      isJson: typeof this.deserializeValue(item.value) === 'object',
    }));

    return {
      total: deserializedData.length,
      data: deserializedData,
    };
  }
}
