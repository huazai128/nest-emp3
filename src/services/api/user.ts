import type { ResponseData } from '@src/interfaces/response.iterface';
import http from '@src/services/http';
import type { HttpParams } from '@src/services/http';

/**
 * 用户登录
 * @param data 登录参数
 * @returns Promise<ResponseData<T>> 返回登录响应结果
 */
function login<T>(data: HttpParams): Promise<ResponseData<T>> {
  return http.post<T>(data);
}

// 导出用户相关接口
export default {
  login,
};
