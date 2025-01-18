import { Module } from '@nestjs/common';
import { WechatAuthController } from './wechat-auth.controller';
import { WechatAuthService } from './wechat-auth.service';

/**
 * 微信授权模块
 *
 * 提供微信网页授权相关功能:
 * 1. 处理微信授权回调,获取用户信息
 * 2. 提供access_token管理服务
 * 3. 验证token有效性
 * 4. 刷新token
 */
@Module({
  imports: [],
  controllers: [WechatAuthController],
  providers: [WechatAuthService],
})
export class WechatAuthModule {}
