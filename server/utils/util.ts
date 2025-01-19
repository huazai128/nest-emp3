import { Request } from 'express';
import { networkInterfaces } from 'os';

/**
 * 获取服务端IP
 * @export
 * @return {*}
 */
export function getServerIp(): string | undefined {
  const interfaces = networkInterfaces();
  for (const devName in interfaces) {
    const iface = interfaces[devName] as Array<any>;
    for (let i = 0; i < iface.length; i++) {
      const alias = iface[i];
      if (
        alias.family === 'IPv4' &&
        alias.address !== '127.0.0.1' &&
        !alias.internal
      ) {
        return alias.address;
      }
    }
  }
}

/**
 * 判断是否为微信浏览器
 * @param req Express请求对象
 * @returns {boolean} 是否为微信浏览器
 */
export function isWechat(req: Request): boolean {
  const userAgent = req.headers['user-agent'];
  return userAgent ? /MicroMessenger/i.test(userAgent) : false;
}

/**
 * 填充URL参数
 * @param params - 要添加的参数对象
 * @param url - 原始URL
 * @param withouts - 要排除的参数名数组
 * @returns 添加参数后的完整URL
 *
 * @example
 * // 添加参数
 * fillParams({foo: 'bar'}, 'http://example.com')
 * // => 'http://example.com?foo=bar'
 *
 * // 排除某些参数
 * fillParams({foo: 'bar', baz: 'qux'}, 'http://example.com', ['baz'])
 * // => 'http://example.com?foo=bar'
 */
export function fillParams(
  params: Record<string, string>,
  url: string,
  withouts: string[] = [],
): string {
  // 解构URL的路径和哈希部分
  const [pathAndQuery, hash = ''] = url.split('#');
  const [path, queryString = ''] = pathAndQuery.split('?');

  // 合并现有参数和新参数
  const originParams = new URLSearchParams(queryString);
  const mergedParams = new URLSearchParams();

  // 添加新参数
  Object.entries(params).forEach(([key, value]) => {
    if (!withouts.includes(key)) {
      mergedParams.set(key, value);
    }
  });

  // 保留不在without列表中的原始参数
  originParams.forEach((value, key) => {
    if (!withouts.includes(key)) {
      mergedParams.set(key, value);
    }
  });

  // 构建最终URL
  const query = mergedParams.toString();
  const queryPart = query ? `?${query}` : '';
  const hashPart = hash ? `#${hash}` : '';

  return `${path}${queryPart}${hashPart}`;
}

/**
 * 生成微信授权URL
 * @param pageUrl - 授权后回跳的页面URL
 * @param appId - 微信公众号appId
 * @param scope - 授权作用域(snsapi_base/snsapi_userinfo)
 * @param state - 状态参数,可用于防止CSRF攻击
 * @returns 完整的微信授权URL
 *
 * @example
 * goWechatUrl(
 *   'http://example.com',
 *   'wx123456',
 *   'snsapi_userinfo',
 *   'STATE'
 * )
 */
export function goWechatUrl(
  pageUrl: string,
  appId: string,
  scope: string,
  state: string,
): string {
  // 处理回调URL,移除不需要的参数
  const redirectUri = fillParams({}, pageUrl, [
    'code',
    'state',
    'authDataKey',
    'client',
  ]);

  // 构建微信授权URL
  const wechatAuthBaseUrl =
    'https://open.weixin.qq.com/connect/oauth2/authorize';
  const params = new URLSearchParams();

  // 不对redirect_uri进行encodeURIComponent,因为URLSearchParams会自动编码
  params.append('appid', appId);
  params.append('redirect_uri', redirectUri);
  params.append('response_type', 'code');
  params.append('scope', scope);
  params.append('state', state || String(Date.now())); // 使用传入的state或时间戳

  return `${wechatAuthBaseUrl}?${params.toString()}#wechat_redirect`;
}
