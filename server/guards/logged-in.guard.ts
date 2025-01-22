import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * @description 登录守卫
 * @export
 * @class LoggedInGuard
 * @extends {AuthGuard('jwt')}
 */
@Injectable()
export class LoggedInGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    // 直接返回父类的 canActivate 方法，req 变量未被使用，故去除
    return super.canActivate(context);
  }
}
