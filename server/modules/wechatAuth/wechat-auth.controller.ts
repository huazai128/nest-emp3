import { createLogger } from '@app/utils/logger';
import { Controller, Get, Query, Req } from '@nestjs/common';
import { WechatAuthService } from './wechat-auth.service';
import { getWxUrlFromReq } from '@app/utils/wx';
import { Request } from 'express';

const logger = createLogger({
  scope: 'WechatAuthController',
  time: true,
});

@Controller('api/wechat-auth')
export class WechatAuthController {
  constructor(private readonly wechatAuthService: WechatAuthService) {}
  /**
   * PC端处理微信授权回调
   * 接收code并获取用户信息,然后重定向回原页面
   */
  @Get('wx-login-callback')
  async handleWechatAuth(@Query('code') code: string) {
    logger.info('handleWechatAuth', code);
    this.wechatAuthService.handleWechatLoginCallback(code);
    logger.info('handleWechatAuth');
  }
  /**
   * 获取微信JS SDK配置
   * @param {string} url - 当前页面的URL
   * @returns {Promise<Object>} - 返回微信JS SDK的配置对象
   */
  @Get('wx-config')
  async getWxConfig(@Req() req: Request) {
    const url = getWxUrlFromReq(req);
    logger.info('getWxConfig', url);
    return this.wechatAuthService.getWxConfig(url);
  }
}
