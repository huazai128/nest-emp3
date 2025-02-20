import { Injectable } from '@nestjs/common';
import { AxiosService } from '@app/processors/axios/axios.service';
import { HttpRequest } from '@app/interfaces/request.interface';

/**
 * 转发服务
 * 用于处理 API 请求的转发
 * @export
 * @class TransferService
 */
@Injectable()
export class TransferService {
  constructor(private readonly axiosService: AxiosService) {}

  /**
   * 处理 GET 请求转发
   * @param {HttpRequest} param 请求参数
   * @param {string} param.transformUrl 转发目标 URL
   * @param {any} param.transferData 转发数据
   * @returns {Promise<any>} 转发响应结果
   */
  public async get({ transformUrl, transferData }: HttpRequest): Promise<any> {
    return this.axiosService.get(transformUrl, transferData);
  }

  /**
   * 处理 POST 请求转发
   * @param {HttpRequest} param 请求参数
   * @param {string} param.transformUrl 转发目标 URL
   * @param {any} param.transferData 转发数据
   * @returns {Promise<any>} 转发响应结果
   */
  public async post({ transformUrl, transferData }: HttpRequest): Promise<any> {
    return this.axiosService.post(transformUrl, transferData);
  }
}
