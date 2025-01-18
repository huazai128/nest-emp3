import { ConfigServer } from '@app/interfaces/config.interface';
import { wechatConfig } from '../config';

const config: ConfigServer = {
  redisConf: {
    host: 'localhost',
    port: 6379,
  },
  redis: {
    type: 'single',
    url: 'redis://localhost:6379',
  },
  wechat: wechatConfig,
};

export default config;
