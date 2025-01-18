import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RouterModule } from './modules/router/router.module';
import { RedisCoreModule } from './processors/redis/redis.module';
import { CONFIG } from '@app/configs';

@Module({
  imports: [RedisCoreModule.forRoot(CONFIG.redis), RouterModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
