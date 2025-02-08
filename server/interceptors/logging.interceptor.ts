import {
  Injectable,
  NestInterceptor,
  CallHandler,
  ExecutionContext,
} from '@nestjs/common';
import { Request } from 'express';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { createLogger } from '@app/utils/logger';
import { isDevEnv } from '@app/configs';

/**
 * 创建日志记录器实例
 * scope: 指定日志作用域为LoggingInterceptor
 * time: 启用时间戳记录
 */
const logger = createLogger({ scope: 'LoggingInterceptor', time: true });

/**
 * 日志拦截器
 * 用于记录请求和响应的日志信息
 */
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  /**
   * 拦截请求和响应
   * @param context - 执行上下文
   * @param next - 调用处理器
   * @returns Observable
   */
  intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<any> {
    // 获取请求处理流
    const call$ = next.handle();

    // 非开发环境下直接返回,不记录日志
    if (!isDevEnv) {
      return call$;
    }

    // 获取请求对象
    const request = context.switchToHttp().getRequest<Request>();

    // 构造日志内容,包含请求方法和URL
    const content = `${request.method} -> ${request.url}`;

    // 记录请求日志
    logger.debug('+++ req：', content);

    // 记录请求开始时间
    const startTime = Date.now();

    // 使用tap操作符记录响应日志和耗时
    return call$.pipe(
      tap(() => {
        const duration = Date.now() - startTime;
        logger.debug('--- res：', content, `${duration}ms`);
      }),
    );
  }
}
