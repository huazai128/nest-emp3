import { Request } from 'express';

/**
 * 从请求中获取微信JS SDK的URL
 * @param {Request} req - 请求对象
 * @returns {string} - 返回微信JS SDK的URL
 */
export function getWxUrlFromReq(req: Request) {
  const apiUrl = req.headers['referer'] as string;
  return apiUrl
    ? apiUrl
    : req.protocol + '://' + req.get('host') + req.originalUrl;
}
