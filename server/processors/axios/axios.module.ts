import { Global, Module } from '@nestjs/common';
import { AxiosService } from './axios.service';
/**
 * Axios模块
 * 用于处理HTTP请求
 */
@Global()
@Module({
  imports: [],
  exports: [AxiosService],
  providers: [AxiosService],
})
export class AxiosModule {}
