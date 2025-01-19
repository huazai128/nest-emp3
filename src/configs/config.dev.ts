import type { ConfigParams } from '@src/interfaces/config.interface';

const config: ConfigParams = {
  apiHost: window.INIT_DATA?.apiHost || '',
  wsUrl: 'ws://172.26.132.136:8081',
};

export default config;
