import session from 'express-session';
import devConfig from './dev.config';

// 环境变量
export const environment = process.env.NODE_ENV;

// 运行环境标识
export const isDevEnv = !environment || Object.is(environment, 'dev');
export const isProdEnv = Object.is(environment, 'prod');
export const isTestEnv = Object.is(environment, 'test');

// // 配置文件,根据环境变量加载不同配置
export const CONFIG = isProdEnv ? devConfig : devConfig;

// 应用配置
export const APP = {
  PORT: 3003, // 应用端口号
  DEFAULT_CACHE_TTL: 60 * 60 * 24, // 默认缓存时间,单位秒
};

// 跨域配置
export const CROSS_DOMAIN = {
  // 可以做redis 缓存
  // 允许访问的域名列表
  allowedOrigins: [''],
  // 允许的referer域名
  allowedReferer: ['a.com', 'b.com'],
};

// Cookie密钥
export const COOKIE_KEY = '@-nest-emp3-*5&^^%%$$#$##-qadlp]]';

// Session配置
export const SESSION: session.SessionOptions = {
  secret: 'wx-client-session-secret-das23-4241nsdf-%52132=-', // session密钥
  name: 'sid', // cookie名称
  saveUninitialized: false, // 是否自动保存未初始化的会话
  resave: false, // 是否每次都重新保存会话
  cookie: {
    sameSite: true, // 限制第三方Cookie
    httpOnly: true, // 仅允许服务端修改
    maxAge: 7 * 24 * 60 * 60 * 1000, // cookie有效期为7天
  },
  rolling: true, // 每次请求时强制设置cookie,重置cookie过期时间
};

// 认证相关配置
export const AUTH = {
  jwtTokenSecret: 'grpc_client_token_f2_we-_adasd_122-sdasdas_asdvfhfhj', // JWT密钥
  expiresIn: 3600 * 24 * 7, // token有效期为7天,单位秒
};
