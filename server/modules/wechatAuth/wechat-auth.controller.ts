import { Controller, Get, Query, Res } from '@nestjs/common';
import { Response } from 'express';

@Controller('wechat-auth')
export class WechatAuthController {
  /**
   * 处理微信授权回调
   * 接收code并获取用户信息,然后重定向回原页面
   */
  @Get()
  async handleWechatAuth(
    @Query('code') code: string,
    @Query('redirect') redirect: string,
    @Res() res: Response,
  ) {
    try {
      if (!code) {
        throw new Error('未获取到微信授权code');
      }

      // TODO: 使用code获取access_token和用户信息
      // const accessToken = await this.getAccessToken(code);
      // const userInfo = await this.getUserInfo(accessToken);

      // 如果有重定向地址,则重定向回原页面
      if (redirect) {
        const userInfoParam = encodeURIComponent(
          JSON.stringify({
            // userInfo
          }),
        );
        return res.redirect(`${redirect}?userInfo=${userInfoParam}`);
      }

      return {
        code: 200,
        message: '微信授权成功',
        data: {
          // userInfo
        },
      };
    } catch (error) {
      return {
        code: 500,
        message: error.message || '微信授权失败',
      };
    }
  }
}
