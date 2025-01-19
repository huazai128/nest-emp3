import { Module } from '@nestjs/common';
import { RouterController } from './router.controller';
import { RouterSercive } from './router.service';
import { WechatAuthModule } from '../wechatAuth/wechat-auth.module';

@Module({
  imports: [WechatAuthModule],
  controllers: [RouterController],
  providers: [RouterSercive],
})
export class RouterModule {}
