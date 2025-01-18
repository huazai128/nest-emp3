import { ConfigServer } from '@app/interfaces/config.interface';

const config: ConfigServer = {
  redisConf: {
    host: 'localhost',
    port: 6379,
  },
  redis: {
    type: 'single',
    url: 'redis://localhost:6379',
  },
  wechat: {
    appId: 'wxb768f91e8b44ebba',
    appSecret: 'c542762463d14cd2144d2a3796becd4c',
  },
};

export default config;
