import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { CROSS_DOMAIN, isProdEnv } from '@app/configs';

const isAllowed = (field, allowedList) =>
  !field || allowedList.some((item) => field.includes(item));

/**
 * 用于验证是否为非法来源
 * @export
 * @class OriginMiddleware
 * @implements {NestMiddleware}
 */
@Injectable()
export class OriginMiddleware implements NestMiddleware {
  use(request: Request, response: Response, next: NextFunction) {
    if (isProdEnv) {
      const { origin, referer } = request.headers;
      const isAllowedOrigin = isAllowed(origin, CROSS_DOMAIN.allowedReferer);
      const isAllowedReferer = isAllowed(referer, CROSS_DOMAIN.allowedReferer);
      if (!isAllowedOrigin && !isAllowedReferer) {
        return response.status(401).jsonp({
          status: 401,
          message: '非法来源',
          error: null,
        });
      }
    }
    return next();
  }
}
