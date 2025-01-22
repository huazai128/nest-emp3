import { AUTH } from '@app/configs'; // 导入配置文件中的AUTH
import { Injectable } from '@nestjs/common'; // 导入NestJS的Injectable装饰器
import { PassportStrategy } from '@nestjs/passport'; // 导入PassportStrategy类
import { Strategy } from 'passport-jwt'; // 导入JWT策略
import { UserService } from './user.service'; // 导入用户服务
import { Request } from 'express'; // 导入Express请求对象

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
        const token = req.cookies['jwt']; // 获取cookie中的jwt
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
    const res = await this.userService.validateUser(payload.data); // 调用用户服务验证用户
    return res; // 返回验证结果
  }
}
