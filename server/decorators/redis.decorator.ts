import {
  getRedisConnectionToken,
  getRedisOptionsToken,
} from '@app/processors/redis/redis.util';
import { Inject } from '@nestjs/common';

/**
 * Redis连接装饰器
 * @returns Inject装饰器,注入Redis连接实例
 */
export const InjectRedis = () => {
  return Inject(getRedisConnectionToken());
};

/**
 * Redis配置装饰器
 * @returns Inject装饰器,注入Redis配置选项
 */
export const InjectRedisOptions = () => {
  return Inject(getRedisOptionsToken());
};
