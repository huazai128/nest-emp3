import { MiddlewareConsumer, Module } from '@nestjs/common';
import { AppService } from '@app/app.service';
import { RedisCoreModule } from '@app/processors/redis/redis.module';
import { CONFIG, SESSION } from '@app/configs';
import { RedisService } from '@app/processors/redis/redis.service';
import session from 'express-session';
import { RedisStore } from 'connect-redis';
import { OriginMiddleware } from '@app/middlewares/origin.middleware';
import { CorsMiddleware } from '@app/middlewares/cors.middleware';
import { WechatAuthMiddleware } from '@app/middlewares/wechat.middleware';
import { RouterController } from '@app/modules/router/router.controller';
import { DatabaseModule } from '@app/processors/database/database.module';
import modules from '@app/modules';
import { LocalMiddleware } from '@app/middlewares/local.middleware';
import { AppMiddleware } from '@app/middlewares/app.middleware';
import { AxiosModule } from '@app/processors/axios/axios.module';

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
    AxiosModule,
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
    // 建议将session配置抽离为单独的中间件
    const sessionMiddleware = session({
      store: new RedisStore({
        client: this.redisService.client,
      }),
      ...SESSION,
      // 建议添加安全相关配置
      cookie: {
        secure: process.env.NODE_ENV === 'production', // 在生产环境使用 HTTPS
      },
    });

    // 应用通用中间件到所有路由
    consumer
      .apply(
        // 跨域资源共享中间件
        CorsMiddleware,
        // 来源验证中间件
        OriginMiddleware,
        // Session会话中间件
        sessionMiddleware,
        // 本地开发环境中间件
        LocalMiddleware,
        // 内部APP授权中间件
        AppMiddleware,
      )
      .forRoutes('*');

    // 单独应用微信认证中间件到RouterModule
    consumer.apply(WechatAuthMiddleware).forRoutes(RouterController); // RouterModule中定义的路由
  }
}
