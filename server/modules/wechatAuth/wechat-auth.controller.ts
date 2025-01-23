import { createLogger } from '@app/utils/logger';
import { Controller, Get, Query } from '@nestjs/common';
import { WechatAuthService } from './wechat-auth.service';

const logger = createLogger({
  scope: 'WechatAuthController',
  time: true,
});

@Controller('api/wechat-auth')
export class WechatAuthController {
  constructor(private readonly wechatAuthService: WechatAuthService) {}
  /**
   * 处理微信授权回调
   * 接收code并获取用户信息,然后重定向回原页面
   */
  @Get('wx-login-callback')
  async handleWechatAuth(@Query('code') code: string) {
    logger.info('handleWechatAuth', code);
    this.wechatAuthService.handleWechatLoginCallback(code);
    logger.info('handleWechatAuth');
  }
}
