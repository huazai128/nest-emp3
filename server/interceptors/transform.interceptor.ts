import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  HttpResponseSuccess,
  ResponseStatus,
} from '@app/interfaces/response.interface';
import { getResponsorOptions } from '@app/decorators/responsor.decorator';

/**
 * 拦截, 只针对API才处理拦截，这里特别注意下路由访问中不要存在/api/
 * @export
 * @class TransformInterceptor
 * @implements {NestInterceptor<T, HttpResponse<T>>}
 * @template T
 */
@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, T | HttpResponseSuccess<T>>
{
  async intercept(
    context: ExecutionContext,
    next: CallHandler<T>,
  ): Promise<Observable<T | HttpResponseSuccess<T>> | any> {
    const target = context.getHandler();

    const { successMessage } = getResponsorOptions(target);

    // 检查请求是否为 gRPC 或 HTTP API
    const request = context.switchToHttp().getRequest(); // 对于 HTTP 请求
    // API 路由必须 /api/ 开头
    const isApiRequest =
      request && request.url && request.url.startsWith('/api/');
    // 如果是 API 请求，则进行转换
    if (isApiRequest) {
      return next.handle().pipe(
        map((data: any) => {
          return {
            status: ResponseStatus.Success,
            message: successMessage || '请求成功',
            result: data,
          };
        }),
      );
    }
    // 如果不是 API 请求，直接返回原始数据
    return next.handle();
  }
}
