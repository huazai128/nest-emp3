import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class WechatAuthService {
  private readonly appId: string;
  private readonly appSecret: string;

  /**
   * 通过code获取access_token
   */
  async getAccessToken(code: string) {
    const url = `https://api.weixin.qq.com/sns/oauth2/access_token?appid=${this.appId}&secret=${this.appSecret}&code=${code}&grant_type=authorization_code`;

    try {
      const response = await axios.get(url);
      return response.data;
    } catch (error) {
      throw new Error('获取access_token失败: ' + error.message);
    }
  }

  /**
   * 获取用户信息
   */
  async getUserInfo(accessToken: string, openId: string) {
    const url = `https://api.weixin.qq.com/sns/userinfo?access_token=${accessToken}&openid=${openId}&lang=zh_CN`;

    try {
      const response = await axios.get(url);
      return response.data;
    } catch (error) {
      throw new Error('获取用户信息失败: ' + error.message);
    }
  }

  /**
   * 刷新access_token
   */
  async refreshToken(refreshToken: string) {
    const url = `https://api.weixin.qq.com/sns/oauth2/refresh_token?appid=${this.appId}&grant_type=refresh_token&refresh_token=${refreshToken}`;

    try {
      const response = await axios.get(url);
      return response.data;
    } catch (error) {
      throw new Error('刷新access_token失败: ' + error.message);
    }
  }

  /**
   * 验证access_token是否有效
   */
  async validateAccessToken(accessToken: string, openId: string) {
    const url = `https://api.weixin.qq.com/sns/auth?access_token=${accessToken}&openid=${openId}`;

    try {
      const response = await axios.get(url);
      return response.data.errcode === 0;
    } catch (error) {
      console.log(error);
      return false;
    }
  }
}
