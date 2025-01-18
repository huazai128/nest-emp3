import {
  getRedisConnectionToken,
  getRedisOptionsToken,
} from '@app/processors/redis/redis.util';
import { Inject } from '@nestjs/common';

export const InjectRedis = () => {
  return Inject(getRedisConnectionToken());
};

export const InjectRedisOptions = () => {
  return Inject(getRedisOptionsToken());
};
