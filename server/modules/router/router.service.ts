import { APP, isDevEnv } from '@app/configs';
import { getServerIp } from '@app/utils/util';
import { Injectable } from '@nestjs/common';
import { Request } from 'express';
import { WechatAuthService } from '../wechatAuth/wechat-auth.service';
import { wechatConfig } from '@app/config';
import { createLogger } from '@app/utils/logger';

const logger = createLogger({ scope: 'router', time: true });

interface CommonData {
  userInfo?: {
    name?: string;
    userId?: string;
  };
  apiHost?: string;
  openId?: string;
}

/**
 * 处理路由下各种数据
 * @export
 * @class RouterSercive
 */
@Injectable()
export class RouterService {
  constructor(private readonly wechatAuthService: WechatAuthService) {}
  /**
   * 获取公共数据
   * @param {Request} req - 请求对象
   * @returns {Object} 返回公共数据
   */
  public getCommonData(req: Request) {
    const user = req.session?.user;

    const data: CommonData = {
      userInfo: {
        name: user?.nickname || user?.account,
        userId: user?.userId?.toString(),
      },
      openId: wechatConfig.appId,
    };
    logger.log('公共数据', data);
    if (isDevEnv) {
      data.apiHost = `http://${getServerIp()}:${APP.PORT}`;
    }
    return data;
  }

  /**
   * 生成微信登录链接
   * @param {string} redirectUri - 登录成功后的重定向地址
   * @returns {string} 返回生成的微信登录链接
   */
  public generateWechatLoginUrl(redirectUri: string) {
    return this.wechatAuthService.generateWechatLoginUrl(redirectUri);
  }
}
