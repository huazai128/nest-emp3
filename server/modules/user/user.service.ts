import { Injectable } from '@nestjs/common';
import { User } from './user.model';
import { Model } from 'mongoose';
import { InjectModel } from '@app/transformers/model.transform';
import { createLogger } from '@app/utils/logger';
import { AUTH } from '@app/configs';
import { JwtService } from '@nestjs/jwt';
import { AuthInfo, UserInfo } from '@app/interfaces/auth.interface';

const logger = createLogger({
  scope: 'UserService',
  time: true,
});
/**
 * 用户服务
 * 该服务负责处理用户相关的业务逻辑
 */
@Injectable()
export class UserService {
  // 这里可以添加用户服务的相关方法
  // 例如: 创建用户、获取用户信息、更新用户信息等
  constructor(
    @InjectModel(User) private authModel: Model<User>,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * 用户登录微信
   * @param userData - 用户数据
   * @returns 用户信息
   */
  public async loginWx(userData: any): Promise<AuthInfo> {
    // 根据用户的openId查找现有用户
    let existingUser = await this.authModel.findOne({
      openid: userData.openid,
    });
    // 如果没有找到现有用户，则创建一个新用户
    if (!existingUser) {
      existingUser = await this.authModel.create(userData);
    }
    // 如果用户创建失败，则抛出错误
    if (!existingUser) {
      throw new Error('用户创建失败');
    }
    // 根据用户userId、openId、nickname生成token
    const token = this.generateToken(
      existingUser.userId.toString() || '',
      existingUser.openid || '',
      existingUser.nickname || '',
    );
    logger.info('loginWx', existingUser);
    return {
      user: {
        userId: existingUser.userId,
        openid: existingUser.openid || '',
        nickname: existingUser.nickname || '',
        account: existingUser.account || '',
      },
      token,
    };
  }
  /**
   * 生成token
   * @param userId - 用户ID
   * @param openId - 用户openId
   * @param nickname - 用户昵称
   * @returns token
   */
  private generateToken(
    userId: string,
    openId: string,
    nickname: string,
  ): { accessToken: string; expiresIn: number } {
    const token = {
      accessToken: this.jwtService.sign({ userId, openId, nickname }),
      expiresIn: AUTH.expiresIn as number,
    };
    return token;
  }

  public async creatToken(userInfo: UserInfo) {
    const token = {
      accessToken: this.jwtService.sign({
        userId: userInfo.userId,
        account: userInfo.account,
      }),
      expiresIn: AUTH.expiresIn as number,
    };
    return token;
  }

  /**
   * 验证用户
   * @param {ValidateUserRequest} { userId }
   * @return {*}
   * @memberof AuthService
   */
  public async validateUser(userId: number) {
    return await this.getFindUserId(userId);
  }

  /**
   * 根据用户ID查找用户
   * @param userId - 用户ID
   * @returns 用户信息
   */
  public async getFindUserId(userId: number) {
    return this.authModel.findOne({ userId }).exec();
  }

  /**
   * 通过验证获取用户信息
   * @param {string} jwt
   * @return {*}  {Promise<any>}
   * @memberof AuthService
   */
  public async verifyAsync(jwt: string): Promise<any> {
    const payload = await this.jwtService.verifyAsync(jwt, {
      secret: AUTH.jwtTokenSecret,
    });
    return payload;
  }
}
