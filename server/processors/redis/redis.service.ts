import { Injectable } from '@nestjs/common';
import { Redis } from 'ioredis';
import { createLogger } from '@app/utils/logger';
import { isNil, UNDEFINED } from '@app/constants/value.constant';
import { InjectRedis } from '@app/decorators/redis.decorator';
import { isDevEnv } from '@app/configs';

// 创建日志记录器，用于记录Redis服务相关日志
const logger = createLogger({ scope: 'RedisService', time: isDevEnv });
/**
 * Redis服务类
 * 提供Redis连接和缓存服务
 */
@Injectable()
export class RedisService {
  public client: Redis; // 公开的Redis客户端实例
  private readonly LOCK_TIMEOUT = 10; // 分布式锁默认超时时间(秒)
  private readonly LOCK_RETRY_DELAY = 100; // 获取锁失败重试延迟(毫秒)
  private readonly MAX_LOCK_RETRIES = 5; // 最大重试次数

  constructor(@InjectRedis() private readonly redis: Redis) {
    this.client = this.redis; // 将注入的Redis实例赋值给公共client
    this.registerEventListeners(); // 注册Redis事件监听器
  }

  /**
   * 注册Redis事件监听器，用于监控Redis连接状态
   */
  private registerEventListeners() {
    this.redis.on('connect', () => logger.info('[Redis] connecting...')); // 连接中
    this.redis.on('reconnecting', () => logger.warn('[Redis] reconnecting...')); // 重连中
    this.redis.on('ready', () => logger.info('[Redis] readied!')); // 连接就绪
    this.redis.on('end', () => logger.error('[Redis] Client End!')); // 连接结束
    this.redis.on(
      'error',
      (error) => logger.error('[Redis] Client Error!', error.message), // 错误处理
    );
  }

  /**
   * 序列化方法，将任意值转换为JSON字符串
   * @param value 要序列化的值
   * @returns 序列化后的JSON字符串
   */
  private serialize(value: unknown): string {
    return isNil(value) ? '' : JSON.stringify(value);
  }

  /**
   * 反序列化方法，将JSON字符串转换为指定类型
   * @param value 要反序列化的JSON字符串
   * @returns 反序列化后的值
   */
  private deserialize<T>(value: string | null): T | undefined {
    return isNil(value) ? UNDEFINED : (JSON.parse(value) as T);
  }

  /**
   * 带分布式锁的缓存获取方法
   * 1. 先尝试获取缓存
   * 2. 如果缓存不存在，则尝试获取分布式锁
   * 3. 获取锁成功后执行回退函数获取数据并缓存
   * 4. 释放锁并返回数据
   */
  public async getWithLock<T>(
    key: string,
    fallback: () => Promise<T>,
    ttl: number,
    lockOptions?: {
      timeout?: number;
      retryDelay?: number;
      maxRetries?: number;
    },
  ): Promise<T> {
    // 1. 尝试获取缓存值
    const cached = await this.get<T>(key);
    if (cached !== undefined) return cached;

    // 2. 配置锁参数
    const {
      timeout = this.LOCK_TIMEOUT,
      retryDelay = this.LOCK_RETRY_DELAY,
      maxRetries = this.MAX_LOCK_RETRIES,
    } = lockOptions || {};

    const lockKey = `${key}:lock`;
    let retryCount = 0;

    // 3. 尝试获取分布式锁
    while (retryCount < maxRetries) {
      const locked = await this.redis.set(
        lockKey,
        'LOCKED',
        'EX',
        timeout,
        'NX',
      );

      if (locked) {
        try {
          // 4. 二次校验缓存(防止等待期间已有数据)
          const doubleCheck = await this.get<T>(key);
          if (doubleCheck !== undefined) return doubleCheck;

          // 5. 执行回退函数获取数据
          const data = await fallback();
          await this.set(key, data, ttl);
          return data;
        } finally {
          // 6. 释放分布式锁
          await this.redis.del(lockKey);
        }
      }

      // 7. 未获取到锁时的处理
      retryCount++;
      await new Promise((resolve) => setTimeout(resolve, retryDelay));
    }

    throw new Error(`Failed to acquire lock after ${maxRetries} attempts`);
  }

  /**
   * 高性能管道批量操作方法
   * 使用Redis管道技术批量执行操作，提高性能
   */
  public async pipelineExecute(
    operations: Array<
      | { type: 'SET'; key: string; value: any }
      | { type: 'SETEX'; key: string; value: any; ttl: number }
    >,
  ): Promise<void> {
    const pipeline = this.redis.pipeline();

    operations.forEach((op) => {
      const serializedValue = this.serialize(op.value);
      if (op.type === 'SET') {
        pipeline.set(op.key, serializedValue);
      } else {
        pipeline.setex(op.key, op.ttl, serializedValue);
      }
    });

    await pipeline.exec();
  }

  /**
   * 设置键值对，可选TTL
   * @param key 键
   * @param value 值
   * @param ttl 过期时间(秒)
   */
  public async set(key: string, value: any, ttl?: number): Promise<void> {
    const serialized = this.serialize(value);
    if (ttl) {
      await this.redis.setex(key, ttl, serialized);
    } else {
      await this.redis.set(key, serialized);
    }
  }

  /**
   * 获取键值，返回反序列化后的值
   * @param key 键
   * @returns 反序列化后的值
   */
  public async get<T>(key: string): Promise<T | undefined> {
    const value = await this.redis.get(key);
    return this.deserialize<T>(value);
  }

  /**
   * 批量设置键值对，可选TTL
   * @param kvList 键值对列表
   * @param ttl 过期时间(秒)
   */
  public async mset(kvList: [string, any][], ttl?: number): Promise<void> {
    if (ttl) {
      await this.pipelineExecute(
        kvList.map(([key, value]) => ({
          type: 'SETEX',
          key,
          value,
          ttl,
        })),
      );
    } else {
      await this.redis.mset(
        kvList.map(([key, value]) => [key, this.serialize(value)]),
      );
    }
  }

  /**
   * 批量获取键值
   * @param keys 键列表
   * @returns 反序列化后的值列表
   */
  public mget(...keys: string[]): Promise<any[]> {
    return this.redis
      .mget(keys)
      .then((values) => values.map((v) => this.deserialize(v)));
  }

  /**
   * 批量删除键
   * @param keys 键列表
   */
  public async mdel(...keys: string[]): Promise<void> {
    await this.redis.del(keys);
  }

  /**
   * 删除单个键
   * @param key 键
   * @returns 删除是否成功
   */
  public async del(key: string): Promise<boolean> {
    const result = await this.redis.del(key);
    return result > 0;
  }

  /**
   * 检查键是否存在
   * @param key 键
   * @returns 键是否存在
   */
  public async has(key: string): Promise<boolean> {
    const count = await this.redis.exists(key);
    return count !== 0;
  }

  /**
   * 获取键的剩余生存时间
   * @param key 键
   * @returns 剩余生存时间(秒)
   */
  public async ttl(key: string): Promise<number> {
    return this.redis.ttl(key);
  }

  /**
   * 根据模式匹配获取键列表
   * @param pattern 模式
   * @returns 键列表
   */
  public async keys(pattern = '*'): Promise<string[]> {
    return this.redis.keys(pattern);
  }

  /**
   * 清空所有键
   */
  public async clean(): Promise<void> {
    const allKeys = await this.keys();
    if (allKeys.length) {
      await this.redis.del(allKeys);
    }
  }
}
