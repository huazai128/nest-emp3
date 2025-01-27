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

  private buildAuthUrl(req: Request, matchedDomain: string): string {
    logger.log('开始构建授权URL');
    const currentUrl = `${req.protocol}://${req.get('host')}${req.originalUrl}`;
    logger.log(`当前URL: ${currentUrl}`);

    if (!matchedDomain) {
      logger.log('没有匹配的域名，返回当前URL');
      return currentUrl;
    }

    const authUrl = `${req.protocol}://${matchedDomain}${req.originalUrl}`;
    logger.log(`构建的授权URL: ${authUrl}`);
    const redirectUrl = fillParams(
      {
        redirectUrl: encodeURIComponent(currentUrl),
      },
      authUrl,
    );
    logger.log('最终授权URL:', redirectUrl);

    return redirectUrl;
  }

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
    const user = req.session.user;
    logger.info('user 用户信息', user);
    if (user?.userId) {
      logger.log('用户已存在，直接通过授权');
      return next();
    }
    try {
      const { appId } = wechatConfig;
      logger.log('处理请求URL:', req.originalUrl);

      if (!isWechat(req)) {
        logger.log('非微信环境，直接通过');
        return next();
      }

      logger.log('检查授权状态');
      const code = req.query.code as string;
      const authorized = req.query.authorized as string;

      if (authorized === 'true') {
        logger.log('已授权，直接通过');
        return next();
      }

      if (!code) {
        logger.log('无授权码，开始授权流程');
        const matchedDomain = this.getMatchedDomain(req.originalUrl);
        const authUrl = this.buildAuthUrl(req, matchedDomain);
        const scope = WECHAT_SILENT_AUTH_ROUTES.includes(req.path)
          ? 'snsapi_base'
          : 'snsapi_userinfo';
        const redirectUrl = goWechatUrl(authUrl, appId, scope, 'STATE');
        logger.log(`重定向到微信授权URL: ${redirectUrl}`);

        return res.redirect(redirectUrl);
      }

      logger.log('处理授权回调');
      const redirectUrl = req.query.redirectUrl as string;
      const { user: userInfo, token } =
        await this.wechatAuthService.getAccessToken(code);

      // 立即获取用户信息，确保 session 已经设置
      logger.info('重定向前获取用户信息', req.session.user);
      res.cookie('jwt', token.accessToken, {
        sameSite: true,
        httpOnly: true,
      });
      res.cookie('userId', userInfo.userId);
      req.session.user = userInfo;
      await req.session.save(); // 确保 session 更新
      logger.info(userInfo, '获取用户信息成功===');

      // 处理重定向后，强制刷新页面以确保获取到用户信息
      if (redirectUrl) {
        const decodedRedirectUrl = decodeURIComponent(redirectUrl);
        logger.log(`重定向URL存在，处理授权回调: ${decodedRedirectUrl}`);
        return res.redirect(this.handleRedirect(decodedRedirectUrl));
      } else {
        logger.log('重定向URL不存在，重定向到当前URL');
        return res.redirect(this.handleRedirect(req.originalUrl));
      }
    } catch (error) {
      logger.error('授权处理出错:', error);
      next(error);
    }
  }
}
