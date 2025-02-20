import { NestFactory } from '@nestjs/core';
import { AppModule } from '@app/app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { getServerIp } from '@app/utils/util';
import { APP, COOKIE_KEY } from '@app/configs';
import bodyParser from 'body-parser';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import { get } from 'lodash';
import { Request } from 'express';
import * as ejs from 'ejs';
import { TransformInterceptor } from '@app/interceptors/transform.interceptor';
import { LoggingInterceptor } from '@app/interceptors/logging.interceptor';

async function bootstrap() {
  // 创建 NestJS 应用实例
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // 配置静态资源
  // 配置静态资源服务
  // - 将 ../client 目录设置为静态资源目录
  // - index: false 禁用默认返回 index.html
  // - extensions 定义允许访问的静态资源文件扩展名
  app.useStaticAssets(join(__dirname, '../client'), {
    index: false,
    extensions: ['js', 'css', 'png', 'jpg', 'jpeg', 'gif', 'svg', 'ico'],
  });

  // 修改视图配置
  app.setBaseViewsDir(join(__dirname, '../client')); // 修改为client根目录
  app.setViewEngine('html');
  app.engine('html', ejs.renderFile);

  // 配置中间件
  app.use(compression()); // 启用压缩
  app.use(bodyParser.json({ limit: '10mb' })); // 设置请求体大小限制
  app.use(cookieParser(COOKIE_KEY)); // 解析 cookie

  // 配置日志记录
  // 自定义 morgan token 用于记录用户 ID
  morgan.token(
    'userId',
    (req: Request) =>
      get(req, 'cookies.userId') || get(req, 'session.user.userId') || '-',
  );

  // 自定义 morgan token 用于记录请求参数
  morgan.token('requestParameters', (req: Request) =>
    Object.keys(req.query).length ? JSON.stringify(req.query) : '-',
  );

  // 自定义 morgan token 用于记录请求体
  morgan.token('requestBody', (req: Request) =>
    Object.keys(req.body).length ? JSON.stringify(req.body) : '-',
  );

  // 添加日志格式
  app.use(
    morgan(
      ':method :url :status :userId :requestParameters :requestBody - :response-time ms',
    ),
  );

  app.useGlobalInterceptors(
    new TransformInterceptor(),
    new LoggingInterceptor(),
  );

  // 启动应用
  await app.listen(APP.PORT).then(() => {
    console.info(
      `Application is running on: http://${getServerIp()}:${APP.PORT}`,
    );
  });
}
bootstrap();
