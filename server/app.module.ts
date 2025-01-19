import { MiddlewareConsumer, Module } from '@nestjs/common';
import { AppService } from './app.service';
import { RedisCoreModule } from './processors/redis/redis.module';
import { CONFIG, SESSION } from '@app/configs';
import { RedisService } from './processors/redis/redis.service';
import session from 'express-session';
import { RedisStore } from 'connect-redis';
import { OriginMiddleware } from './middlewares/origin.middleware';
import { CorsMiddleware } from './middlewares/cors.middleware';
import { WechatAuthMiddleware } from './middlewares/wechat.middleware';
import { RouterController } from './modules/router/router.controller';
import { DatabaseModule } from './processors/database/database.module';
import modules from './modules';

/**
 * 应用程序主模块
 * @export
 * @class AppModule
 */
@Module({
  imports: [
    // Redis核心模块,用于处理缓存
    RedisCoreModule.forRoot(CONFIG.redis),
    DatabaseModule,
    ...modules,
  ],
  controllers: [],
  providers: [AppService],
})
export class AppModule {
  constructor(private readonly redisService: RedisService) {}

  /**
   * 配置全局中间件
   * @param {MiddlewareConsumer} consumer - 中间件消费者
   */
  configure(consumer: MiddlewareConsumer) {
    // 应用通用中间件到所有路由
    consumer
      .apply(
        // 跨域资源共享中间件
        CorsMiddleware,
        // 来源验证中间件
        OriginMiddleware,
        // Session会话中间件
        session({
          // 使用Redis存储session
          store: new RedisStore({
            client: this.redisService.client,
          }),
          ...SESSION,
        }),
      )
      .forRoutes('*');

    // 单独应用微信认证中间件到RouterModule
    consumer.apply(WechatAuthMiddleware).forRoutes(RouterController); // RouterModule中定义的路由
  }
}
