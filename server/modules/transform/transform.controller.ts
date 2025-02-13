import { Body, Controller, Get, Post } from '@nestjs/common';
import { TransferService } from './transform.service';
import { Responsor } from '@app/decorators/responsor.decorator';
import { TransformPipe } from '@app/pipes/transform.pipe';
import { HttpRequest } from '@app/interfaces/request.interface';
import { QueryParams } from '@app/decorators/params.decorator';
import { createLogger } from '@app/utils/logger';

const logger = createLogger({
  scope: 'transform',
  time: true,
});

@Controller('api')
export class TransferController {
  constructor(private readonly transferService: TransferService) {}

  /**
   * Get 接口转发
   * @param {HttpRequest} data 请求参数,经过TransformPipe处理
   * @return {Promise<any>} 转发后的响应结果
   * @memberof TransferController
   */
  @Responsor.api()
  @Get('transform')
  getTransform(@QueryParams('query', new TransformPipe()) data: HttpRequest) {
    logger.info('getTransform', data);
    return this.transferService.get(data);
  }

  /**
   * Post 接口转发
   * @param {HttpRequest} data
   * @return {*}
   * @memberof ApiConstroller
   */
  @Responsor.api()
  @Post('transform')
  postTransform(@Body(new TransformPipe()) data: HttpRequest) {
    logger.info('postTransform', data);
    return this.transferService.post(data);
  }
}
