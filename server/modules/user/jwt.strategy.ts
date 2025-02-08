import { AUTH } from '@app/configs';
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-jwt';
import { UserService } from './user.service';
import { Request } from 'express';
import { get } from 'lodash';
import { createLogger } from '@app/utils/logger';

const logger = createLogger({
  scope: 'JwtStrategy',
  time: true,
});

/**
 * JWT策略
 * 用于验证JWT并返回用户信息
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  // 继承PassportStrategy
  constructor(private readonly userService: UserService) {
    // 构造函数注入UserService
    super({
      jwtFromRequest: (req: Request) => {
        // 从请求中获取JWT
        // 从cookie中获取token
        const token = get(req, 'cookies.jwt');
        logger.log(token, 'token');
        return token || null; // 如果jwt为空，返回null以避免报错
      },
      secretOrKey: AUTH.jwtTokenSecret, // 设置JWT的密钥
    });
  }

  /**
   * 验证用户
   * @param {*} payload - JWT载荷
   * @return {*}
   * @memberof JwtStrategy
   */
  async validate(payload: any) {
    // 验证JWT载荷
    if (!payload || !payload.userId) {
      logger.error('无效的JWT载荷');
      return null;
    }

    try {
      // 调用用户服务验证用户
      const user = await this.userService.validateUser(Number(payload.userId));
      if (!user) {
        logger.error('用户不存在');
        return null;
      }
      return user;
    } catch (error) {
      logger.error('验证用户失败:', error);
      return null;
    }
  }
}
