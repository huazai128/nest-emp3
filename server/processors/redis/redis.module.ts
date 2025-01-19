import {
  RedisModuleAsyncOptions,
  RedisModuleOptions,
  RedisModuleOptionsFactory,
} from '@app/interfaces/redis.interface';
import { DynamicModule, Global, Module, Provider } from '@nestjs/common';
import {
  createRedisConnection,
  getRedisConnectionToken,
  getRedisOptionsToken,
} from './redis.util';
import { RedisService } from './redis.service';
import { createLogger } from '@app/utils/logger';
import { CacheService } from './cache.service';

// 创建日志记录器
const logger = createLogger({ scope: 'RedisCoreModule', time: true });

/**
 * Redis核心模块
 * 提供Redis连接和缓存服务
 */
@Global() // 声明为全局模块
@Module({
  imports: [],
  providers: [RedisService, CacheService], // 提供Redis服务和缓存服务
  exports: [RedisService, CacheService], // 导出服务供其他模块使用
})
export class RedisCoreModule {
  /**
   * 同步方式初始化Redis模块
   * @param options Redis配置选项
   * @returns 动态模块配置
   */
  static forRoot(options: RedisModuleOptions): DynamicModule {
    // 创建Redis配置提供器
    const redisOptionsProvider: Provider = {
      provide: getRedisOptionsToken(),
      useValue: options,
    };

    // 创建Redis连接提供器
    const redisConnectionProvider: Provider = {
      provide: getRedisConnectionToken(),
      useValue: createRedisConnection(options),
    };

    return {
      module: RedisCoreModule,
      providers: [redisOptionsProvider, redisConnectionProvider],
      exports: [redisOptionsProvider, redisConnectionProvider],
    };
  }

  /**
   * 异步方式初始化Redis模块
   * 支持依赖注入方式配置
   * @param options 异步配置选项
   * @returns 动态模块配置
   */
  static forRootAsync(options: RedisModuleAsyncOptions): DynamicModule {
    // 创建Redis连接提供器
    const redisConnectionProvider: Provider = {
      provide: getRedisConnectionToken(),
      useFactory(options: RedisModuleOptions) {
        return createRedisConnection(options);
      },
      inject: [getRedisOptionsToken()], // 注入Redis配置
    };

    return {
      module: RedisCoreModule,
      imports: options.imports,
      providers: [
        ...this.createAsyncProviders(options),
        redisConnectionProvider,
      ],
      exports: [redisConnectionProvider],
    };
  }

  /**
   * 创建异步配置提供器
   * 支持useClass、useFactory、useExisting三种方式
   * @param options 异步配置选项
   * @returns 提供器数组
   */
  public static createAsyncProviders(
    options: RedisModuleAsyncOptions,
  ): Provider[] {
    // 验证配置方式是否有效
    if (!(options.useExisting || options.useFactory || options.useClass)) {
      throw new Error(
        '无效配置，提供器只提供useClass、useFactory、useExisting这三种自定义提供器',
      );
    }

    // 使用已存在的提供器或工厂方法
    if (options.useExisting || options.useFactory) {
      return [this.createAsyncOptionsProvider(options)];
    }

    // 使用类提供器
    if (!options.useClass) {
      throw new Error(
        '无效配置，提供器只提供useClass、useFactory、useExisting这三种自定义提供器',
      );
    }

    return [
      this.createAsyncOptionsProvider(options),
      { provide: options.useClass, useClass: options.useClass },
    ];
  }

  /**
   * 创建异步配置选项提供器
   * @param options 异步配置选项
   * @returns 配置提供器
   */
  public static createAsyncOptionsProvider(
    options: RedisModuleAsyncOptions,
  ): Provider {
    // 验证配置方式是否有效
    if (!(options.useExisting || options.useFactory || options.useClass)) {
      throw new Error(
        '无效配置，提供器只提供useClass、useFactory、useExisting这三种自定义提供器',
      );
    }

    // 使用工厂方法方式
    if (options.useFactory) {
      return {
        provide: getRedisOptionsToken(),
        useFactory: options.useFactory,
        inject: options.inject || [],
      };
    }

    // 使用类或已存在实例方式
    return {
      provide: getRedisOptionsToken(),
      async useFactory(
        optionsFactory: RedisModuleOptionsFactory,
      ): Promise<RedisModuleOptions> {
        return await optionsFactory.createRedisModuleOptions();
      },
      inject: [options.useClass || options.useExisting] as never,
    };
  }
}
