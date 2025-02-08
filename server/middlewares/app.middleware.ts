import { isDevEnv } from '@app/configs';
import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { createLogger } from '@app/utils/logger';
import { UserService } from '@app/modules/user/user.service';
import { get } from 'lodash';

const logger = createLogger({
  scope: 'AppMiddleware',
  time: true,
});

/**
 * 内部APP授权中间件
 * @export
 * @class AppMiddleware
 * @implements {NestMiddleware}
 */
@Injectable()
export class AppMiddleware implements NestMiddleware {
  constructor(private readonly userService: UserService) {}
  async use(req: Request, res: Response, next: NextFunction) {
    // isApp 这里还要加上一个app 来源判断，在UA或者cookie 加上一个标识用于判断是否为内部APP.
    // 如果不是共享token, 则根据app来其他信息配置获取登录信息
    // if (!isDevEnv && isApp) {
    if (!isDevEnv) {
      logger.info('来源为app内嵌h5页面授权');
      // 把用户相关信息注入到UA或者cookie中，通过UA或者cookie获取用户信息进行授权登录。
      // 确保服务端生成的jwt和node服务规则一致，如果不行可以通过grpc调用服务获取数据
      const jwt = get(req, 'cookies.jwt');
      if (jwt) {
        try {
          const { data } = await this.userService.verifyAsync(jwt);
          res.cookie('jwt', data.accessToken, {
            sameSite: true,
            httpOnly: true,
          });
          res.cookie('userId', data.userId);
          // 强制注入cookie
          req.cookies['jwt'] = data.accessToken;
          req.session.user = data;
        } catch (error) {
          logger.error(error, 'app授权失败');
          throw new Error(
            '抛出异常，如果是api, 直接报错，如果是页面就跳转到登录页面',
          );
        }
      }
    }
    return next();
  }
}
