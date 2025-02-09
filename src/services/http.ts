import axios from 'axios';
import type { AxiosRequestConfig as _AxiosRequestConfig, Method } from 'axios';
import type { ResponseData } from '@src/interfaces/response.iterface';
import { pickBy } from 'lodash';

const apiHost = window.INIT_DATA?.apiHost;

/**
 * 扩展 AxiosRequestConfig 类型,添加请求开始时间
 */
export interface AxiosRequestConfig extends _AxiosRequestConfig {
  startTime?: Date;
}

/**
 * 判断值是否为空(null或undefined)
 */
const isNotEmpty = (value: any) => value !== null && value !== undefined;

/**
 * HTTP请求参数类型
 */
export type HttpParams = {
  transformUrl?: string; // 转发接口
  data?: object | FormData; // 转发参数
  apiUrl?: string; // node 层接口
  apiTransferType?: string; // 对应其他域名，默认不添为baseApi
};

/**
 * GET请求参数类型
 */
export type GetParmas = Omit<HttpParams, 'data' | 'otherConfig' | 'apiUrl'> & {
  transferData: any;
};

/**
 * HTTP错误类型枚举
 */
enum HTTPERROR {
  LOGICERROR, // 逻辑错误
  TIMEOUTERROR, // 超时错误
  NETWORKERROR, // 网络错误
}

/**
 * HTTP请求配置接口
 */
interface HttpReq {
  data: HttpParams; // 请求数据
  otherConfig?: AxiosRequestConfig; // 其他配置
}

/**
 * 判断请求是否成功
 */
const isSuccess = (res: any) => Object.is(res.status, 'success');

/**
 * 格式化返回结果
 */
const resFormat = (res: any) => res;

/**
 * HTTP通用请求方法
 * @param method 请求方法
 * @param param1 请求配置
 * @returns Promise
 */
function httpCommon<T>(
  method: Method,
  { data: { apiUrl, ...data }, otherConfig }: HttpReq,
): Promise<ResponseData<T> | any> {
  let axiosConfig: AxiosRequestConfig = {
    method,
    url: apiUrl || 'api/transform',
    baseURL: apiHost,
  };
  const instance = axios.create();

  // 请求拦截器
  instance.interceptors.request.use(
    (cfg) => {
      // 添加时间戳防止缓存
      cfg.params = { ...cfg.params, ts: Date.now() / 1000 };
      return cfg;
    },
    (error) => Promise.reject(error),
  );

  // 响应拦截器
  instance.interceptors.response.use(
    (response) => {
      const rdata = response.data;
      console.log('response', response);
      if (!isSuccess(rdata)) {
        return Promise.reject(rdata);
      }
      return resFormat(rdata);
    },
    (error) => {
      // 处理错误信息
      const msg = Array.isArray(error.response.data?.message)
        ? error.response.data?.message[0]
        : error.response.data?.message;
      return Promise.reject({
        message:
          msg ||
          error.response.data.error ||
          error.response.statusText ||
          error.message ||
          'network error',
        result: /^timeout of/.test(error.message)
          ? HTTPERROR[HTTPERROR.TIMEOUTERROR]
          : HTTPERROR[HTTPERROR.NETWORKERROR],
        status: 'error',
      });
    },
  );

  // 过滤空值
  const params = pickBy({ ...data }, isNotEmpty);

  // 根据请求方法设置参数
  if (method === 'get') {
    axiosConfig.params = params;
  } else {
    axiosConfig.data = params;
  }

  // 记录请求开始时间
  axiosConfig.startTime = new Date();

  // 合并其他配置
  if (otherConfig) {
    axiosConfig = Object.assign(axiosConfig, otherConfig);
  }

  return instance
    .request(axiosConfig)
    .then((res) => res)
    .catch((err) => err);
}

/**
 * GET请求
 * @param data 请求数据
 * @param otherConfig 其他配置
 * @returns Promise
 */
function get<T>(data: HttpParams, otherConfig: AxiosRequestConfig = {}) {
  return httpCommon<T>('get', { data, otherConfig });
}

/**
 * POST请求
 * @param data 请求数据
 * @param otherConfig 其他配置
 * @returns Promise
 */
function post<T>(data: HttpParams, otherConfig: AxiosRequestConfig = {}) {
  return httpCommon<T>('post', { data, otherConfig });
}

/**
 * DELETE请求
 * @param apiUrl 接口地址
 * @param data 请求数据
 * @param otherConfig 其他配置
 * @returns Promise
 */
function deleteId<T>(data: HttpParams, otherConfig: AxiosRequestConfig = {}) {
  return httpCommon<T>('delete', { data, otherConfig });
}

/**
 * PUT请求
 * @param apiUrl 接口地址
 * @param data 请求数据
 * @param otherConfig 其他配置
 * @returns Promise
 */
function put<T>(
  apiUrl: string,
  data: HttpParams,
  otherConfig: AxiosRequestConfig = {},
) {
  return httpCommon<T>('put', { data, otherConfig });
}

export default {
  put,
  get,
  post,
  deleteId,
};
