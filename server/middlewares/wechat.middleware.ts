import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { fillParams, goWechatUrl, isWechat } from '@app/utils/util';
import { ROUTE_DOMAIN_MAP } from '@app/constants/route-domain.constant';
import { wechatConfig } from '@app/config';
import { CacheService } from '@app/processors/redis/cache.service';
import { createLogger } from '@app/utils/logger';
import { WechatAuthService } from '@app/modules/wechatAuth/wechat-auth.service';
import { WECHAT_SILENT_AUTH_ROUTES } from '@app/constants/route-domain.constant';
// 创建一个日志记录器实例，用于记录日志信息
const logger = createLogger({
  scope: 'WechatAuthMiddleware',
  time: true,
});

/**
 * 微信授权中间件
 * 用于处理微信网页授权流程
 */
@Injectable()
export class WechatAuthMiddleware implements NestMiddleware {
  constructor(
    private readonly cacheService: CacheService,
    private readonly wechatAuthService: WechatAuthService,
  ) {}

  /**
   * 获取当前路由对应的授权域名
   * @param originalUrl - 请求的原始URL
   * @returns 匹配的授权域名
   */
  private getMatchedDomain(originalUrl: string): string {
    logger.log('获取匹配的授权域名');
    for (const [route, domain] of ROUTE_DOMAIN_MAP.entries()) {
      if (originalUrl.startsWith(route)) {
        logger.log(`匹配到的域名: ${domain}`);
        return domain;
      }
    }
    logger.log('未匹配到任何域名');
    return '';
  }

  /**
   * 构建授权URL
   * @param req - 请求对象
   * @param matchedDomain - 匹配的授权域名
   * @returns 构建的授权URL
   */
  private buildAuthUrl(req: Request, matchedDomain: string): string {
    logger.log('开始构建授权URL');
    const currentUrl = `${req.protocol}://${req.get('host')}${req.originalUrl}`;
    logger.log(`当前URL: ${currentUrl}`);

    if (!matchedDomain) {
      logger.log('没有匹配的域名，返回当前URL');
      return currentUrl;
    }

    // 构建授权URL
    const authUrl = `${req.protocol}://${matchedDomain}${req.originalUrl}`;
    logger.log(`构建的授权URL: ${authUrl}`);
    // 填充参数到授权URL中
    const redirectUrl = fillParams(
      {
        redirectUrl: encodeURIComponent(currentUrl),
      },
      authUrl,
    );
    // 记录授权URL
    logger.log('最终授权URL:', redirectUrl);

    return redirectUrl;
  }

  /**
   * 处理微信授权重定向
   * @param redirectUrl - 重定向的URL
   * @returns 处理后的重定向URL
   */
  private handleRedirect(redirectUrl: string): string {
    logger.log('处理微信授权重定向');
    const url = fillParams(
      {
        authorized: 'true',
      },
      redirectUrl,
      ['code', 'state'],
    );
    logger.log(`处理后的重定向URL: ${url}`);
    return url;
  }

  async use(req: Request, res: Response, next: NextFunction) {
    try {
      const { appId } = wechatConfig;
      logger.log('处理请求URL:', req.originalUrl);

      // 1. 非微信环境直接通过
      if (!isWechat(req)) {
        logger.log('非微信环境，直接通过');
        return next();
      }

      // 2. 检查授权状态
      logger.log('检查授权状态');
      const code = req.query.code as string;
      const authorized = req.query.authorized as string;

      // 3. 已授权直接通过
      if (authorized === 'true') {
        logger.log('已授权，直接通过');
        return next();
      }

      // 4. 无code则重定向授权
      if (!code) {
        logger.log('无授权码，开始授权流程');
        // 获取匹配的授权域名，这里可能同时静默授权两次不同的域名
        const matchedDomain = this.getMatchedDomain(req.originalUrl);
        // 构建授权URL
        const authUrl = this.buildAuthUrl(req, matchedDomain);
        // 判断是否为静默授权路由
        const scope = WECHAT_SILENT_AUTH_ROUTES.includes(req.path)
          ? 'snsapi_base'
          : 'snsapi_userinfo';
        const redirectUrl = goWechatUrl(authUrl, appId, scope, 'STATE');
        logger.log(`重定向到微信授权URL: ${redirectUrl}`);

        return res.redirect(redirectUrl);
      }

      // 5. 处理授权回调
      logger.log('处理授权回调');
      // 获取重定向URL
      const redirectUrl = req.query.redirectUrl as string;
      const userInfo = await this.wechatAuthService.getAccessToken(code);
      logger.info(userInfo, '获取用户信息成功');
      // 如果重定向URL存在，则处理授权回调
      if (redirectUrl) {
        const decodedRedirectUrl = decodeURIComponent(redirectUrl);
        logger.log(`重定向URL存在，处理授权回调: ${decodedRedirectUrl}`);
        return res.redirect(this.handleRedirect(decodedRedirectUrl));
      } else {
        // 如果重定向URL不存在，则重定向到当前URL
        logger.log('重定向URL不存在，重定向到当前URL');
        return res.redirect(this.handleRedirect(req.originalUrl));
      }
    } catch (error) {
      logger.error('授权处理出错:', error); // 添加错误日志记录
      next(error);
    }
  }
}
