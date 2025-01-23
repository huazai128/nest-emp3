import { ExecutionContext, Injectable } from '@nestjs/common';
import { LoggedInGuard } from './logged-in.guard';
import { HttpUnauthorizedError } from '@app/errors/unauthorized.error';
import { Reflector } from '@nestjs/core';
import { Roles } from '@app/decorators/roles.decorator';
import { get } from 'lodash';
import { createLogger } from '@app/utils/logger';

const logger = createLogger({
  scope: 'RouterGuard',
  time: true,
});

/**
 * 路由守卫
 * 用于处理路由的权限验证
 */
@Injectable()
export class RouterGuard extends LoggedInGuard {
  constructor(private reflector: Reflector) {
    super();
  }

  async canActivate(context: ExecutionContext) {
    // 获取当前处理程序的角色信息
    // const roles = this.reflector.get(Roles, context.getHandler());
    // if (!roles) {
    //   throw new HttpUnauthorizedError('没有权限访问');
    // }

    const request = context.switchToHttp().getRequest();
    // 从请求中获取用户信息
    const user = get(request, 'session.user');
    logger.log('RouterGuard', user);
    // 检查是否为微信H5访问，如果是则不进行拦截
    const userAgent = request.headers['user-agent'];
    const isWechatH5 = /MicroMessenger/i.test(userAgent);
    if (isWechatH5) {
      return true; // 允许访问
    }

    // TODO: 目前还没有roles字段存储到session中，需要保存到session中
    // 这里可以添加逻辑来处理用户角色的存储

    // 调用父类的canActivate方法进行权限验证
    const res = await super.canActivate(context);
    return res as boolean;
  }

  handleRequest(error, authInfo, errInfo) {
    // 处理请求的授权信息
    if (authInfo && !error && !errInfo) {
      return authInfo;
    } else {
      // 抛出未授权错误
      throw (
        error || new HttpUnauthorizedError(errInfo?.message || '没有权限访问')
      );
    }
  }
}
