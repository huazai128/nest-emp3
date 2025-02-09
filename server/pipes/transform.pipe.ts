import { CONFIG } from '@app/configs';
import { HttpRequest } from '@app/interfaces/request.interface';
import { PipeTransform, Injectable } from '@nestjs/common';

/**
 * 拼接转发接口
 * @export
 * @class TransformPipe
 * @implements {PipeTransform<HttpRequest, HttpRequest>}
 */
@Injectable()
export class TransformPipe implements PipeTransform<HttpRequest, HttpRequest> {
  transform(data: HttpRequest): HttpRequest {
    const apiTransferType: any = data.apiTransferType || 'baseApi';
    const transferUrl = data.transformUrl || {};
    const url = CONFIG.apiPrefix[apiTransferType] + transferUrl;

    return {
      ...data,
      transformUrl: url,
    };
  }
}
