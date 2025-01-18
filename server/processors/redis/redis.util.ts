/**
 * Redis工具类
 * 提供Redis连接相关的工具函数
 */

import {
  REDIS_MODULE_CONNECTION,
  REDIS_MODULE_CONNECTION_TOKEN,
  REDIS_MODULE_OPTIONS_TOKEN,
} from '@app/constants/redis.constant';
import { RedisModuleOptions } from '@app/interfaces/redis.interface';
import logger from '@app/utils/logger';
import { Redis, RedisOptions } from 'ioredis';

/**
 * 生成用于获取Redis配置信息的注入token
 * @returns {string} Redis配置token
 */
export function getRedisOptionsToken(): string {
  return `${REDIS_MODULE_CONNECTION}_${REDIS_MODULE_OPTIONS_TOKEN}`;
}

/**
 * 生成用于获取Redis实例的注入token
 * @returns {string} Redis连接token
 */
export function getRedisConnectionToken(): string {
  return `${REDIS_MODULE_CONNECTION}_${REDIS_MODULE_CONNECTION_TOKEN}`;
}

/**
 * Redis重试策略函数
 * 当Redis连接失败时,根据重试次数决定重试间隔
 * @param {number} retries - 当前重试次数
 * @returns {number|null} 重试间隔时间(毫秒),返回null表示不再重试
 */
export function retryStrategy(retries: number): number | null {
  const errorMessage = [
    '[Redis]',
    `retryStrategy！retries: ${JSON.stringify(retries)}`,
  ];
  logger.error(...(errorMessage as [any]));
  // 这里可以加上告警
  if (retries > 8) {
    new Error('[Redis] 尝试次数已达极限！');
    return null;
  }
  return Math.min(retries * 1000, 3000);
}

/**
 * 创建Redis连接
 * 支持单机模式和集群模式
 * @param {RedisModuleOptions} options - Redis连接配置
 * @returns {Redis} Redis客户端实例
 */
export function createRedisConnection(options: RedisModuleOptions) {
  const { type, options: commonOptions = {} } = options;
  switch (type) {
    // 单例或者哨兵模式
    case 'single':
      const { url, options: { port, host } = {} } = options;
      const connectionOptions: RedisOptions = {
        retryStrategy: retryStrategy,
        ...commonOptions,
        port,
        host,
      };
      return url
        ? new Redis(url, connectionOptions)
        : new Redis(connectionOptions);
    case 'cluster': // 集群
      return new Redis.Cluster(options.nodes, commonOptions);
    default:
      throw new Error('无效配置，请查看配置文档');
  }
}
