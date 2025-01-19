import { Request, Response, NextFunction } from 'express';
import {
  Injectable,
  NestMiddleware,
  HttpStatus,
  RequestMethod,
} from '@nestjs/common';
import { isDevEnv } from '@app/configs';
import { CROSS_DOMAIN } from '@app/configs';
import logger from '@app/utils/logger';

/**
 * CORS 中间件
 * 用于处理跨域资源共享(CORS)相关的响应头设置
 */
@Injectable()
export class CorsMiddleware implements NestMiddleware {
  use(req: Request, response: Response, next: NextFunction) {
    // 将 RequestMethod 枚举值转换为对应的字符串方法名
    const getMethod = (method) => RequestMethod[method];

    // 获取并规范化请求头中的 origin
    const origin = this.normalizeOrigin(req.headers.origin);

    // 允许的请求方法列表
    const allowedMethods = [
      RequestMethod.GET,
      RequestMethod.HEAD,
      RequestMethod.PUT,
      RequestMethod.PATCH,
      RequestMethod.POST,
      RequestMethod.DELETE,
    ];

    // 允许的请求头列表
    const allowedHeaders = this.getAllowedHeaders();

    // 设置 CORS 相关响应头
    this.setCorsHeaders(response, {
      origin,
      allowedMethods,
      allowedHeaders,
      getMethod,
    });

    // 记录响应状态
    this.logResponseStatus(response);

    // 处理 OPTIONS 预检请求
    if (req.method === getMethod(RequestMethod.OPTIONS)) {
      return response.sendStatus(HttpStatus.NO_CONTENT);
    }

    return next();
  }

  /**
   * 规范化 Origin 值
   */
  private normalizeOrigin(origins: string | string[] | undefined): string {
    return (Array.isArray(origins) ? origins[0] : origins) || '';
  }

  /**
   * 获取允许的请求头列表
   */
  private getAllowedHeaders(): string[] {
    return [
      'Authorization',
      'Origin',
      'No-Cache',
      'X-Requested-With',
      'If-Modified-Since',
      'Pragma',
      'Last-Modified',
      'Cache-Control',
      'Expires',
      'Content-Type',
      'X-E4M-With',
    ];
  }

  /**
   * 设置 CORS 相关响应头
   */
  private setCorsHeaders(
    response: Response,
    config: {
      origin: string;
      allowedMethods: RequestMethod[];
      allowedHeaders: string[];
      getMethod: (method: RequestMethod) => string;
    },
  ) {
    const { origin, allowedMethods, allowedHeaders, getMethod } = config;

    // 设置允许的源
    if (!origin || CROSS_DOMAIN.allowedOrigins.includes(origin) || isDevEnv) {
      response.setHeader('Access-Control-Allow-Origin', origin || '*');
    }

    // 设置其他 CORS 相关头
    response.setHeader('Timing-Allow-Origin', '*');
    response.header('Access-Control-Allow-Credentials', 'true');
    response.header('Access-Control-Allow-Headers', allowedHeaders.join(','));
    response.header(
      'Access-Control-Allow-Methods',
      allowedMethods.map(getMethod).join(','),
    );
    response.header('Access-Control-Max-Age', '1728000');
    response.header('Content-Type', 'application/json; charset=utf-8');
  }

  /**
   * 记录响应状态
   */
  private logResponseStatus(response: Response) {
    response.on('finish', () => {
      const statusCode = response.statusCode;
      const statusMessage = HttpStatus[statusCode];
      logger.info(`Response Code: ${statusCode} - ${statusMessage}`);
    });
  }
}
