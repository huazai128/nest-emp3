// 导入所需的依赖
import { Injectable } from '@nestjs/common';
import { Redis } from 'ioredis';
import { createLogger } from '@app/utils/logger';
import { isNil, UNDEFINED } from '@app/constants/value.constant';
import { RedisModuleOptions } from '@app/interfaces/redis.interface';
import {
  InjectRedis,
  InjectRedisOptions,
} from '@app/decorators/redis.decorator';
import { isDevEnv } from '@app/configs';

// 创建日志记录器
const logger = createLogger({ scope: 'RedisService', time: isDevEnv });

/**
 * Redis 服务
 * 提供 Redis 数据库操作能力
 * 支持数据的序列化与反序列化
 * 监听 Redis 连接状态
 * @export
 * @class RedisService
 */
@Injectable()
export class RedisService {
  // Redis客户端实例
  public client: Redis;

  constructor(
    @InjectRedis() private readonly redis: Redis,
    @InjectRedisOptions() private readonly redisOptions: RedisModuleOptions,
  ) {
    this.client = this.redis;
    // 监听redis相关事件
    this.redis.on('connect', () => {
      logger.info('[Redis]', 'connecting...');
    });
    this.redis.on('reconnecting', () => {
      logger.warn('[Redis]', 'reconnecting...');
    });
    this.redis.on('ready', () => {
      logger.info('[Redis]', 'readied!');
    });
    this.redis.on('end', () => {
      logger.error('[Redis]', 'Client End!');
    });
    this.redis.on('error', (error) => {
      logger.error('[Redis]', `Client Error!`, error.message);
    });
  }

  /**
   * 解析参数
   * @private
   * @template T
   * @param {(string | null | void)} value
   * @return {*}
   * @memberof RedisService
   */
  private parseValue<T>(value: string | null | void) {
    // 如果值为空则返回undefined,否则解析JSON
    return isNil(value) ? UNDEFINED : (JSON.parse(value) as T);
  }

  /**
   * value 转成 string
   * @private
   * @param {unknown} value
   * @return {*}  {string}
   * @memberof RedisService
   */
  private stringifyValue(value: unknown): string {
    // 如果值为空则返回空字符串,否则转换为JSON字符串
    return isNil(value) ? '' : JSON.stringify(value);
  }

  /**
   * redis 设置值
   * @param {string} key
   * @param {*} value
   * @param {number} [ttl]
   * @return {*}  {Promise<void>}
   * @memberof RedisService
   */
  public async set(key: string, value: any, ttl?: number): Promise<void> {
    // 将值转换为字符串
    const _value = this.stringifyValue(value);
    // 如果设置了过期时间且不为0,则使用EX参数设置过期时间
    if (!isNil(ttl) && ttl !== 0) {
      await this.redis.set(key, _value, 'EX', ttl);
    } else {
      await this.redis.set(key, _value);
    }
  }

  /**
   * redis 获取值
   * @template T
   * @param {string} key
   * @return {*}  {(Promise<T | undefined>)}
   * @memberof RedisService
   */
  public async get<T>(key: string): Promise<T | undefined> {
    // 获取值并解析
    const value = await this.redis.get(key);
    return this.parseValue<T>(value);
  }

  /**
   * mset事务添加或者批量添加
   * @param {[string, any][]} kvList
   * @param {number} [ttl]
   * @return {*}  {Promise<void>}
   * @memberof RedisService
   */
  public async mset(kvList: [string, any][], ttl?: number): Promise<void> {
    // 如果设置了过期时间且不为0,则使用事务批量设置
    if (!isNil(ttl) && ttl !== 0) {
      const multi = this.redis.multi();
      for (const [key, value] of kvList) {
        multi.set(key, this.stringifyValue(value), 'EX', ttl);
      }
      await multi.exec();
    } else {
      // 批量添加,不设置过期时间
      await this.redis.mset(
        kvList.map(([key, value]) => {
          return [key, this.stringifyValue(value)] as [string, string];
        }),
      );
    }
  }

  /**
   * 批量获取
   * @param {...string[]} keys
   * @return {*}  {Promise<any[]>}
   * @memberof RedisService
   */
  public mget(...keys: string[]): Promise<any[]> {
    // 批量获取值并解析
    return this.redis.mget(keys).then((values) => {
      return values.map((value) => this.parseValue<unknown>(value));
    });
  }

  /**
   * 批量删除
   * @param {...string[]} keys
   * @memberof RedisService
   */
  public async mdel(...keys: string[]) {
    // 批量删除key
    await this.redis.del(keys);
  }

  /**
   * 单个删除
   * @param {string} key
   * @return {*}  {Promise<boolean>}
   * @memberof RedisService
   */
  public async del(key: string): Promise<boolean> {
    // 删除单个key,返回是否删除成功
    const deleted = await this.redis.del(key);
    return deleted > 0;
  }

  /**
   * 查询集合中是否有指定的key
   * @param {string} key
   * @return {*}  {Promise<boolean>}
   * @memberof RedisService
   */
  public async has(key: string): Promise<boolean> {
    // 检查key是否存在
    const count = await this.redis.exists(key);
    return count !== 0;
  }

  /**
   * 以秒为单位，返回给定 key 的剩余生存时间
   * @param {string} key
   * @return {*}  {Promise<number>}
   * @memberof RedisService
   */
  public async ttl(key: string): Promise<number> {
    // 获取key的剩余生存时间
    return await this.redis.ttl(key);
  }

  /**
   * 获取所有key
   * @param {string} [pattern='*']
   * @return {*}  {Promise<string[]>}
   * @memberof RedisService
   */
  public async keys(pattern = '*'): Promise<string[]> {
    // 根据pattern获取匹配的所有key
    return await this.redis.keys(pattern);
  }

  /**
   * 清除所有
   * @memberof RedisService
   */
  public async clean() {
    // 清除所有keys
    await this.redis.del(await this.keys());
  }
}
