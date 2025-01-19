import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import * as ejs from 'ejs';
import { getServerIp } from './utils/util';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.useStaticAssets(join(__dirname, '../client'), {
    index: false,
    extensions: ['js', 'css', 'png', 'jpg', 'jpeg', 'gif', 'svg', 'ico'],
  });
  app.setBaseViewsDir(join(__dirname, '../client'));

  app.setViewEngine('html');
  app.engine('html', ejs.renderFile);

  await app.listen(3003).then(() => {
    console.info(`Application is running on: http://${getServerIp()}:${3003}`);
  });
}
bootstrap();
