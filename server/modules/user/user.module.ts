import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { UserProvider } from './user.model';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AUTH } from '@app/configs';
import { JwtStrategy } from './jwt.strategy';

/**
 * 用户模块
 * 该模块负责用户相关的功能
 */
@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      global: true,
      secret: AUTH.jwtTokenSecret,
      signOptions: {
        expiresIn: AUTH.expiresIn as number,
      },
    }),
  ],
  controllers: [UserController],
  providers: [UserProvider, UserService, JwtStrategy],
  exports: [UserService],
})
export class UserModule {}
