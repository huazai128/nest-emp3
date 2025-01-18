import { RedisModuleOptions } from './redis.interface';

export interface ConfigServer {
  redisConf: {
    host: string;
    port: number;
  };
  redis: {
    type: string;
    url: string;
  };
  wechat: {
    appId: string;
    appSecret: string;
  };
}
