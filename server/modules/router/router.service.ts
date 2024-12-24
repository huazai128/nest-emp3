import { Injectable } from '@nestjs/common';
import { Request } from 'express';

/**
 * 处理路由下各种数据
 * @export
 * @class RouterSercive
 */
@Injectable()
export class RouterSercive {
  public getCommonData(req: Request) {
    return {
      name: 'w',
    };
  }
}
