import { isDevEnv } from '@app/configs';
import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { UserService } from '@app/modules/user/user.service';
import { createLogger } from '@app/utils/logger';

const logger = createLogger({
  scope: 'LocalMiddleware',
  time: true,
});

/**
 * 本地开发环境中间件
 * 用于在开发环境下自动注入用户身份信息
 * @export
 * @class LocalMiddleware
 * @implements {NestMiddleware}
 */
@Injectable()
export class LocalMiddleware implements NestMiddleware {
  constructor(private readonly userService: UserService) {}

  /**
   * 中间件处理函数
   * @param {Request} req - 请求对象
   * @param {Response} res - 响应对象
   * @param {NextFunction} next - 下一个中间件函数
   * @returns {Promise<void>}
   */
  async use(req: Request, res: Response, next: NextFunction) {
    logger.log('本地开发环境中间件', isDevEnv);
    // 仅在开发环境下执行
    if (isDevEnv) {
      // 创建默认管理员用户信息
      const userInfo = {
        account: 'admin', // 默认管理员账号
        userId: 1000000000, // 默认管理员ID
      };

      // 生成JWT令牌
      const token = await this.userService.creatToken(userInfo);

      // 设置JWT令牌cookie
      res.cookie('jwt', token.accessToken, {
        sameSite: true, // 仅允许同站点请求携带cookie
        httpOnly: true, // 仅允许HTTP请求访问cookie,防止XSS攻击
      });

      // 设置用户ID cookie
      res.cookie('userId', userInfo.userId);

      // 手动注入认证信息到请求对象
      req.cookies['jwt'] = token.accessToken; // 注入JWT令牌
      req.session.user = userInfo; // 注入用户会话信息
    }

    // 继续处理下一个中间件
    return next();
  }
}
