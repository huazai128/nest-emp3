import { Request } from 'express';
import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { getServerIp } from '@app/utils/util';

/**
 * 访问者信息接口
 */
export interface QueryVisitor {
  ip?: string; // IP地址
  ua?: string; // User Agent
  origin?: string; // 来源
  referer?: string; // 引用页
}

/**
 * 用户信息接口
 */
export interface UserInfo {
  userId: string; // 用户ID
  name: string; // 用户名
}

/**
 * Cookie参数接口
 */
export interface QueryCookies {
  [key: string]: any;
}

/**
 * 查询参数结果接口
 */
export interface QueryParamsResult {
  body: Record<string, string>; // 请求体
  params: Record<string, string>; // URL参数
  query: Record<string, string>; // 查询参数
  cookies: QueryCookies; // Cookie
  visitor: QueryVisitor; // 访问者信息
  request: Request; // 原始请求对象
  isAuthenticated: boolean; // 是否已认证
}

/**
 * QueryParams 自定义装饰器，用于解析请求参数
 * @param field - 要获取的字段名
 * @param ctx - 执行上下文
 * @returns 解析后的参数对象或指定字段值
 */
export const QueryParams = createParamDecorator(
  (
    field: keyof QueryParamsResult,
    ctx: ExecutionContext,
  ): QueryParamsResult | any => {
    const request = ctx.switchToHttp().getRequest<Request>();

    // 获取访问者信息
    const visitor: QueryVisitor = {
      ip: getServerIp(), // 获取服务器IP
      ua: request.headers['user-agent'],
      origin: request.headers.origin,
      referer: request.headers.referer,
    };

    // 获取认证状态
    const isAuthenticated = request.isAuthenticated?.() || false;

    // 解析URL参数和查询参数
    const { transformUrl: paramUrl, ...otherParams } = request.params;
    const { transformUrl: queryUrl, ...otherQuery } = request.query;

    // 获取用户信息
    const user: UserInfo = (request.session as any)?.user || {};

    // 构建结果对象
    const result = {
      params: paramUrl
        ? {
            transformUrl: paramUrl,
            transferData: { ...otherParams, userId: user.userId },
          }
        : request.params,
      query: queryUrl
        ? {
            transformUrl: queryUrl,
            transferData: { ...otherQuery, userId: user.userId },
          }
        : request.query,
      body: request.body, // 添加body字段
      cookies: request.cookies,
      isAuthenticated,
      visitor,
      request,
    };

    // 返回指定字段或完整结果
    return field ? result[field] : result;
  },
);
