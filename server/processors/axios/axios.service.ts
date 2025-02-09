import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import axios, { AxiosInstance, AxiosRequestConfig, Method } from 'axios';
import { createLogger } from '@app/utils/logger';
import http from 'http';
import { HttpStatus } from '@nestjs/common';

// 定义未授权状态码
const UnAuthStatus = [401, 403];

// 创建日志记录器实例
const logger = createLogger({ scope: 'AxiosService', time: true });

/**
 * Axios服务类
 * 用于处理HTTP请求,包含日志记录、参数处理、请求头设置和响应统一处理
 */
@Injectable()
export class AxiosService {
  private readonly axiosInstance: AxiosInstance; // Axios实例
  private readonly keepAliveAgent: http.Agent; // HTTP长连接代理

  constructor() {
    // 初始化HTTP长连接代理
    this.keepAliveAgent = new http.Agent({
      keepAlive: true, // 启用长连接
      keepAliveMsecs: 1000 * 30, // 长连接超时时间30秒
    });

    // 创建Axios实例
    this.axiosInstance = this.createInstance();
  }

  private createInstance() {
    const instance = axios.create({
      timeout: 5000, // 请求超时时间5秒
      httpAgent: this.keepAliveAgent,
      httpsAgent: this.keepAliveAgent,
      withCredentials: true, // 允许跨域请求携带cookie
    });

    // 统一配置请求拦截器
    instance.interceptors.request.use(
      (cfg) => {
        cfg.params = { ...cfg.params, ts: Date.now() / 1000 };
        return cfg;
      },
      (error) => Promise.reject(error),
    );

    // 统一配置响应拦截器
    instance.interceptors.response.use(
      (response) => {
        const rdata = response.data || {};
        if (rdata.code === 200 || rdata.code === 0) {
          logger.info(`请求成功: ${response.config.url}`, rdata.result);
          return rdata.result;
        }
        return Promise.reject({
          msg: rdata.message || '接口错误',
          errCode: rdata.code || HttpStatus.BAD_REQUEST,
          config: response.config,
        });
      },
      (error) => this.handleRequestError(error),
    );

    return instance;
  }

  private handleRequestError(error: any) {
    const { response, config } = error;
    const data = response?.data || {};

    return Promise.reject({
      msg:
        data.error || response?.statusText || error.message || 'network error',
      errCode: data.code || response?.status || HttpStatus.BAD_REQUEST,
      config,
    });
  }

  protected async makeObservable<T>(
    method: Method,
    url: string,
    data?: any,
    config?: AxiosRequestConfig,
  ): Promise<T> {
    const axiosConfig: AxiosRequestConfig = {
      method,
      url,
      ...(method === 'get' ? { params: data } : { data }),
      ...config,
      cancelToken: config?.cancelToken || axios.CancelToken.source().token,
    };

    try {
      const response = await this.axiosInstance.request(axiosConfig);
      return response.data || {};
    } catch (err: any) {
      logger.error(
        `请求失败: ${url}, 参数: ${JSON.stringify(data)}, 错误: ${err.msg}`,
      );

      if (UnAuthStatus.includes(err.errCode)) {
        throw new UnauthorizedException(
          {
            status: err.errCode,
            message: err.msg || err.stack,
          },
          err.errCode,
        );
      }

      throw new BadRequestException(
        {
          isApi: !url.includes('/user/info'),
          status: err.errCode,
          message: err.msg || err.stack,
        },
        err.errCode,
      );
    }
  }

  public get<T>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig,
  ): Promise<T> {
    return this.makeObservable<T>('get', url, data, config);
  }

  public post<T>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig,
  ): Promise<T> {
    return this.makeObservable<T>('post', url, data, config);
  }

  public put<T>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig,
  ): Promise<T> {
    return this.makeObservable<T>('put', url, data, config);
  }

  public delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return this.makeObservable<T>('delete', url, undefined, config);
  }
}
