import { ModuleMetadata, Type } from '@nestjs/common/interfaces';
import { RedisOptions, ClusterOptions, ClusterNode } from 'ioredis';

/**
 * Redis单机模式配置选项接口
 */
export interface RedisSingleOptions {
  // 单机模式
  type: 'single';
  // redis连接地址,格式为:redis://host:port
  url?: string;
  // redis连接配置选项
  options?: RedisOptions;
}

/**
 * Redis集群模式配置选项接口
 */
export interface RedisClusterOptions {
  // 集群模式
  type: 'cluster';
  // 集群节点配置
  nodes: ClusterNode[];
  // 集群连接配置选项
  options?: ClusterOptions;
}

/**
 * Redis模块配置选项类型
 * 可以是单机模式或集群模式
 */
export type RedisModuleOptions = RedisSingleOptions | RedisClusterOptions;

/**
 * Redis模块配置工厂接口
 * 用于动态创建Redis模块配置
 */
export interface RedisModuleOptionsFactory {
  createRedisModuleOptions(): Promise<RedisModuleOptions> | RedisModuleOptions;
}

/**
 * Redis模块异步配置选项接口
 * 支持依赖注入、类和工厂方法等多种配置方式
 */
export interface RedisModuleAsyncOptions
  extends Pick<ModuleMetadata, 'imports'> {
  // 需要注入的依赖
  inject?: any[];
  // 使用类创建配置
  useClass?: Type<RedisModuleOptionsFactory>;
  // 使用已存在的配置工厂
  useExisting?: Type<RedisModuleOptionsFactory>;
  // 使用工厂函数创建配置
  useFactory?: (
    ...args: any[]
  ) => Promise<RedisModuleOptions> | RedisModuleOptions;
}
