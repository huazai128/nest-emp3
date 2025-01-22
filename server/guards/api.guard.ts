import { ExecutionContext, Injectable } from '@nestjs/common';
import { LoggedInGuard } from './logged-in.guard';
import { HttpUnauthorizedError } from '@app/errors/unauthorized.error';

/**
 * @description API 守卫
 * @export
 * @class ApiGuard
 * @extends {LoggedInGuard}
 */
@Injectable()
export class ApiGuard extends LoggedInGuard {
  // 检查是否可以激活守卫
  canActivate(context: ExecutionContext) {
    return super.canActivate(context);
  }

  // 处理请求中的错误和认证信息
  handleRequest(error: any, authInfo: any, errInfo: any) {
    // 如果有错误，抛出错误
    if (error) {
      throw error;
    }

    // 验证令牌是否有效
    const validToken = Boolean(authInfo);
    // 检查是否为空令牌且错误信息为“没有权限访问”
    const emptyToken = !authInfo && errInfo?.message === '没有权限访问';

    // 如果令牌有效或为空令牌，返回认证信息或空对象
    if (validToken || emptyToken) {
      return authInfo || {};
    }

    // 否则抛出未授权错误
    throw new HttpUnauthorizedError('没有权限访问');
  }
}
