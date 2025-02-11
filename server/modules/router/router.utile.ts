import { isDevEnv, isProdEnv } from '@app/configs';
import { Request } from 'express';

/**
 * 检测用户代理
 * @param {Request} req - 请求对象
 * @returns {Object} 返回isWx、isApp、isIOS和isAndroid的布尔值
 */
export function detectUserAgent(req: Request) {
  const isWx = req.headers['user-agent']?.includes('MicroMessenger') || false;
  const isApp =
    req.headers['user-agent']?.includes('YourAppIdentifier') || false; // Replace 'YourAppIdentifier' with the actual identifier for your app
  const isIOS =
    req.headers['user-agent']?.includes('iPhone') ||
    req.headers['user-agent']?.includes('iPad') ||
    false;
  const isAndroid = req.headers['user-agent']?.includes('Android') || false;
  return { isWx, isApp, isIOS, isAndroid, isDev: isDevEnv, isProd: isProdEnv };
}
