import { RedisModuleOptions } from './redis.interface';

export interface ConfigServer {
  redisConf: {
    host: string;
    port: number;
  };
  redis: RedisModuleOptions;
  wechat: {
    appId: string;
    appSecret: string;
  };
  apiPrefix: {
    baseApi: string;
    transferApi: string;
  };
}
