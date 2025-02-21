import type { ResponseData } from '@src/interfaces/response.iterface';
import http from '@src/services/http';

/**
 * 用户登录
 * @param data 登录参数
 * @returns Promise<ResponseData<T>> 返回登录响应结果
 */
function getWxConfig<T>(): Promise<ResponseData<T>> {
  return http.get<T>({ apiUrl: '/api/wechat-auth/wx-config' });
}

// 导出用户相关接口
export default {
  getWxConfig,
};
