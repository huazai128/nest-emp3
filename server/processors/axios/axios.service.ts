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

// 创建日志记录器实例,添加时间戳
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
    // 初始化HTTP长连接代理,优化网络性能
    this.keepAliveAgent = new http.Agent({
      keepAlive: true, // 启用长连接
      keepAliveMsecs: 1000 * 30, // 长连接超时时间30秒
      maxSockets: 100, // 最大并发连接数
      maxFreeSockets: 10, // 最大空闲连接数
    });

    // 创建并配置Axios实例
    this.axiosInstance = this.createInstance();
  }

  /**
   * 创建Axios实例并配置拦截器
   */
  private createInstance(): AxiosInstance {
    const instance = axios.create({
      timeout: 5000, // 请求超时时间5秒
      httpAgent: this.keepAliveAgent,
      httpsAgent: this.keepAliveAgent,
      withCredentials: true, // 允许跨域请求携带cookie
      headers: {
        'Content-Type': 'application/json', // 默认请求头
      },
    });

    // 请求拦截器:添加时间戳防止缓存
    instance.interceptors.request.use(
      (cfg) => {
        cfg.params = { ...cfg.params, ts: Date.now() / 1000 };
        logger.info(`发起请求: ${cfg.url}`, cfg.params || cfg.data);
        return cfg;
      },
      (error) => Promise.reject(error),
    );

    // 响应拦截器:统一处理响应数据
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

  /**
   * 统一处理请求错误
   */
  private handleRequestError(error: any) {
    const { response, config } = error;
    const data = response?.data || {};
    const msg =
      data.error || response?.statusText || error.message || 'network error';
    const errCode = data.code || response?.status || HttpStatus.BAD_REQUEST;

    logger.error(`请求失败: ${config.url}, 错误: ${msg}, 状态码: ${errCode}`);

    return Promise.reject({
      msg,
      errCode,
      config,
    });
  }

  /**
   * 发起HTTP请求的核心方法
   */
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

      // 处理未授权异常
      if (UnAuthStatus.includes(err.errCode)) {
        throw new UnauthorizedException(
          {
            status: err.errCode,
            message: err.msg || err.stack,
          },
          err.errCode,
        );
      }

      // 处理其他请求异常
      throw new BadRequestException(
        {
          status: err.errCode,
          message: err.msg || err.stack,
        },
        err.errCode,
      );
    }
  }

  /**
   * GET请求方法
   */
  public get<T>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig,
  ): Promise<T> {
    return this.makeObservable<T>('get', url, data, config);
  }

  /**
   * POST请求方法
   */
  public post<T>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig,
  ): Promise<T> {
    return this.makeObservable<T>('post', url, data, config);
  }

  /**
   * PUT请求方法
   */
  public put<T>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig,
  ): Promise<T> {
    return this.makeObservable<T>('put', url, data, config);
  }

  /**
   * DELETE请求方法
   */
  public delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return this.makeObservable<T>('delete', url, undefined, config);
  }
}
