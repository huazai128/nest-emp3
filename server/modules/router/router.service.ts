import { Injectable } from '@nestjs/common';
import { Request } from 'express';

/**
 * 处理路由下各种数据
 * @export
 * @class RouterSercive
 */
@Injectable()
export class RouterSercive {
  /**
   * 获取公共数据
   * @param {Request} req - 请求对象
   * @returns {Object} 返回公共数据
   */
  public getCommonData(req: Request) {
    return {
      name: 'w',
    };
  }
}
