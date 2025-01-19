import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { UserProvider } from './user.model';

/**
 * 用户模块
 * 该模块负责用户相关的功能
 */
@Module({
  imports: [],
  controllers: [UserController],
  providers: [UserProvider, UserService],
})
export class UserModule {}
