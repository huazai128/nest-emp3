import type { ConfigParams } from '@src/interfaces/config.interface';

const env = process.env.EMP_ENV || 'dev';

let config: ConfigParams;
switch (env) {
  case 'dev':
    config = require('./config.dev').default;
    break;
  case 'prod':
    config = require('./config.prod').default;
    break;
  default:
    config = require('./config.dev').default;
}

export default {
  ...config,
  env,
} as ConfigParams & { env: string };
