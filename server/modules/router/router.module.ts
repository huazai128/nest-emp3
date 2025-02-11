import { Module } from '@nestjs/common';
import { RouterController } from './router.controller';
import { RouterService } from './router.service';
import { WechatAuthModule } from '../wechatAuth/wechat-auth.module';

@Module({
  imports: [WechatAuthModule],
  controllers: [RouterController],
  providers: [RouterService],
})
export class RouterModule {}
