import { Body, Controller, Get, Post } from '@nestjs/common';
import { TransferService } from './transform.service';
import { Responsor } from '@app/decorators/responsor.decorator';
import { TransformPipe } from '@app/pipes/transform.pipe';
import { HttpRequest } from '@app/interfaces/request.interface';
import { QueryParams } from '@app/decorators/params.decorator';

@Controller('api')
export class TransferController {
  constructor(private readonly transferService: TransferService) {}

  @Responsor.api()
  @Get('transform')
  getTransform(@QueryParams('query', new TransformPipe()) data: HttpRequest) {
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
    return this.transferService.post(data);
  }
}
