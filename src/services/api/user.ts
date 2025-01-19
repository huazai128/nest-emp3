// 导入响应数据类型接口
import type { ResponseData } from '@src/interfaces/response.iterface';
// 导入http请求工具
import http from '@src/services/http';
// 导入http请求参数类型
import type { HttpParams } from '@src/services/http';

/**
 * 用户登录
 * @param data 登录参数
 * @returns Promise<ResponseData<T>> 返回登录响应结果
 */
function login<T>(data: HttpParams): Promise<ResponseData<T>> {
  return http.post<T>('api/user/login', data);
}

// 导出用户相关接口
export default {
  login,
};
