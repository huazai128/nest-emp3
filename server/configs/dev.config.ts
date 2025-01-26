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
    // 哨兵模式
    // options: {
    //   sentinels: [
    //     {
    //       host: 'localhost',
    //       port: 26379,
    //     },
    //   ],
    //   sentinelPassword: '',
    //   name: 'master',
    // },
  },
  wechat: wechatConfig,
};

export default config;
