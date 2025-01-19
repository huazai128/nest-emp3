import { Module, Global } from '@nestjs/common';
import { databaseProviders } from './database.providers';

/**
 * 数据base 全局模块
 * @export
 * @class DatabaseModule
 */
@Global()
@Module({
  providers: [...databaseProviders],
  exports: [...databaseProviders],
})
export class DatabaseModule {}
