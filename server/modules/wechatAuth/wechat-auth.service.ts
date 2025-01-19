import { wechatConfig } from '@app/config';
import { APP } from '@app/configs';
import { createLogger } from '@app/utils/logger';
import { getServerIp } from '@app/utils/util';
import { Injectable } from '@nestjs/common';
import axios from 'axios';

const logger = createLogger({
  scope: 'WechatAuthService',
  time: true,
});

/**
 * 微信授权服务
 * 提供获取access_token、用户信息等功能
 */
@Injectable()
export class WechatAuthService {
  private readonly appId: string;
  private readonly appSecret: string;
  constructor() {
    this.appId = wechatConfig.appId;
    this.appSecret = wechatConfig.appSecret;
  }

  /**
   * 通过code获取access_token
   */
  async getAccessToken(code: string) {
    const url = `https://api.weixin.qq.com/sns/oauth2/access_token?appid=${this.appId}&secret=${this.appSecret}&code=${code}&grant_type=authorization_code`;

    try {
      const response = await axios.get(url);
      if (response.data) {
        const data = await this.getUserInfo(
          response.data.access_token,
          response.data.openid,
        );
        logger.info(data, '获取用户信息成功');
      } else {
        throw new Error('获取access_token失败: ' + response.data.errmsg);
      }
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
  /**
   * 刷新access_token
   * 该方法在access_token过期时调用，用于获取新的access_token
   * @param {string} refreshToken - 用于刷新access_token的refresh_token
   * @returns {Object} - 返回新的access_token和其他相关信息
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
   * 该方法用于验证access_token是否有效
   * 一般在需要获取用户信息或进行其他需要用户授权的操作时调用
   * 如果access_token无效，则需要重新获取access_token
   * @param {string} accessToken - 需要验证的access_token
   * @param {string} openId - 用户的openId
   * @returns {boolean} - 返回access_token是否有效
   */
  async validateAccessToken(accessToken: string, openId: string) {
    const url = `https://api.weixin.qq.com/sns/auth?access_token=${accessToken}&openid=${openId}`;

    try {
      const response = await axios.get(url);
      return response.data.errcode === 0;
    } catch (error) {
      logger.error(error, '验证access_token失败');
      return false;
    }
  }

  /**
   * 实现微信扫码登录逻辑
   * 该方法生成微信扫码登录的URL，并处理用户扫码后的回调
   * @param {string} redirectUri - 用户扫码后重定向的URI
   * @returns {string} - 返回生成的微信扫码登录URL
   */
  generateWechatLoginUrl(pageUrl: string): string {
    const redirectUri = `http://${getServerIp()}:${APP.PORT}/api/wechat-auth/wx-login-callback?redirectUri=${pageUrl}`;
    logger.info(redirectUri, 'redirectUri');
    const wechatUrl = `https://open.weixin.qq.com/connect/qrconnect?appid=${this.appId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=&state=STATE#wechat_redirect`;
    return wechatUrl;
  }

  /**
   * 处理微信扫码登录回调
   * 该方法接收微信扫码登录回调的code，并使用code获取access_token和用户信息
   * @param {string} code - 微信扫码登录回调的code
   * @returns {Object} - 返回用户信息
   */
  async handleWechatLoginCallback(code: string) {
    const url = `https://api.weixin.qq.com/sns/oauth2/access_token?appid=${this.appId}&secret=${this.appSecret}&code=${code}&grant_type=authorization_code`;

    try {
      const response = await axios.get(url);
      const { access_token, openid } = response.data;

      // 获取用户信息
      const userInfoUrl = `https://api.weixin.qq.com/sns/userinfo?access_token=${access_token}&openid=${openid}`;
      const userInfoResponse = await axios.get(userInfoUrl);
      logger.log(userInfoResponse.data, '获取用户信息成功');
      return userInfoResponse.data;
    } catch (error) {
      throw new Error('处理微信扫码登录回调失败: ' + error.message);
    }
  }
}
