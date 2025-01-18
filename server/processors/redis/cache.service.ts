import { Injectable } from '@nestjs/common';
import { RedisService } from './redis.service';

// 缓存键类型
export type CacheKey = string;
// 缓存结果类型
export type CacheResult<T> = Promise<T>;

// 缓存Promise选项接口
export interface CachePromiseOption<T> {
  key: CacheKey; // 缓存键
  promise(): CacheResult<T>; // 获取数据的Promise函数
}

// 缓存IO结果接口
export interface CacheIOResult<T> {
  get(): CacheResult<T>; // 获取缓存数据
  update(): CacheResult<T>; // 更新缓存数据
}

// 缓存Promise IO选项接口,继承自CachePromiseOption
export interface CachePromiseIOOption<T> extends CachePromiseOption<T> {
  ioMode?: boolean; // 是否启用IO模式
}

@Injectable()
export class CacheService {
  constructor(private readonly redisService: RedisService) {}

  /**
   * 设置缓存
   * @param {string} key 缓存键
   * @param {string} value 缓存值
   * @param {number} [ttl] 过期时间(可选)
   * @return {*} Promise<void>
   * @memberof CacheService
   */
  public set(key: string, value: string, ttl?: number): Promise<void> {
    return this.redisService.set(key, value, ttl);
  }

  /**
   * 获取缓存
   * @template T 返回值类型
   * @param {string} key 缓存键
   * @return {*} Promise<T> 返回缓存的值
   * @memberof CacheService
   */
  public get<T>(key: string): Promise<T> {
    return this.redisService.get(key) as Promise<T>;
  }

  /**
   * 删除缓存
   * @param {string} key 缓存键
   * @return {*} Promise<boolean> 删除是否成功
   * @memberof CacheService
   */
  public delete(key: string): Promise<boolean> {
    return this.redisService.del(key);
  }

  /**
   * Promise缓存方法
   * @template T 返回值类型
   * @param {CachePromiseOption<T>} options 缓存选项
   * @return {*} CacheResult<T> | CacheIOResult<T>
   * @memberof CacheService
   * @example CacheService.promise({ key: CacheKey, promise() }) -> promise() // 普通模式
   * @example CacheService.promise({ key: CacheKey, promise(), ioMode: true }) -> { get: promise(), update: promise() } // IO模式
   */
  promise<T>(options: CachePromiseOption<T>): CacheResult<T>;
  promise<T>(options: CachePromiseIOOption<T>): CacheIOResult<T>;
  promise(options) {
    const { key, promise, ioMode = false } = options;

    // 执行Promise任务并缓存结果
    const doPromiseTask = async () => {
      const data = await promise();
      await this.set(key, data);
      return data;
    };

    // 被动模式:先查缓存,没有则执行Promise任务
    const handlePromiseMode = async () => {
      const value = await this.get(key);
      return value !== null && value !== undefined
        ? value
        : await doPromiseTask();
    };

    // IO模式:提供get和update方法
    const handleIoMode = () => ({
      get: handlePromiseMode, // 获取数据(优先从缓存)
      update: doPromiseTask, // 强制更新缓存
    });

    return ioMode ? handleIoMode() : handlePromiseMode();
  }
}
