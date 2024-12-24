import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import * as ejs from 'ejs';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.useStaticAssets(join(__dirname, '../../dist/client'));
  app.setBaseViewsDir(join(__dirname, '../../dist/client'));

  app.setViewEngine('html');
  app.engine('html', ejs.renderFile);

  await app.listen(process.env.PORT ?? 3001);
}
bootstrap();
