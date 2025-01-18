import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

/**
 * 微信授权中间件
 * 用于处理微信网页授权流程
 * 1. 判断是否在微信环境中
 * 2. 获取微信授权code
 * 3. 使用code获取access_token和用户信息
 */
@Injectable()
export class WechatAuthMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    // 判断是否来自微信
    const isWechatBrowser = (userAgent: string): boolean => {
      return /MicroMessenger/i.test(userAgent || '');
    };
    const userAgent = req.headers['user-agent'] || '';
    const isWechat = isWechatBrowser(userAgent);

    if (!isWechat) {
      return res.status(403).json({
        code: 403,
        message: '请在微信客户端打开',
      });
    }

    // 获取微信授权code
    const code = req.query.code as string;

    // 如果没有code,重定向到微信授权页面
    if (!code) {
      const appId = process.env.WECHAT_APP_ID; // 从环境变量获取
      const authDomain = process.env.WECHAT_AUTH_DOMAIN; // B域名(授权域名)
      const currentDomain = process.env.CURRENT_DOMAIN; // A域名(当前域名)

      // 构建授权成功后的回调地址(A域名)
      const finalRedirectUri = encodeURIComponent(
        `${currentDomain}${req.originalUrl}`,
      );

      // 构建中间授权页面地址(B域名)
      const authRedirectUri = encodeURIComponent(
        `${authDomain}/wechat-auth?redirect=${finalRedirectUri}`,
      );

      // 微信授权链接
      const authUrl = `https://open.weixin.qq.com/connect/oauth2/authorize?appid=${appId}&redirect_uri=${authRedirectUri}&response_type=code&scope=snsapi_userinfo&state=STATE#wechat_redirect`;

      return res.redirect(authUrl);
    }

    // 有code则继续处理
    try {
      // TODO: 使用code获取access_token和用户信息
      // const accessToken = await this.getAccessToken(code);
      // const userInfo = await this.getUserInfo(accessToken);
      // req.user = userInfo;

      // 如果是B域名的授权回调页面，需要重定向回A域名
      const redirectUrl = req.query.redirect as string;
      if (redirectUrl) {
        // 将用户信息附加到URL参数中
        const userInfoParam = encodeURIComponent(
          JSON.stringify({
            // userInfo
          }),
        );
        return res.redirect(`${redirectUrl}?userInfo=${userInfoParam}`);
      }

      next();
    } catch (error) {
      next(error);
    }
  }

  // private async getAccessToken(code: string) {
  //   // 实现获取access_token的逻辑
  // }

  // private async getUserInfo(accessToken: string) {
  //   // 实现获取用户信息的逻辑
  // }
}
