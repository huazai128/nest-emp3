import * as api from '@src/services/api';

// 定义微信配置接口
interface WxConfigResponse {
  appId: string;
  timestamp: string;
  nonceStr: string;
  signature: string;
}

// 定义支持的微信JS-SDK接口列表
const WX_JS_API_LIST = [
  'checkJsApi',
  'onMenuShareTimeline',
  'onMenuShareAppMessage',
  'onMenuShareQQ',
  'onMenuShareWeibo',
  'onMenuShareQZone',
  'hideMenuItems',
  'showMenuItems',
  'hideAllNonBaseMenuItem',
  'showAllNonBaseMenuItem',
  'translateVoice',
  'startRecord',
  'stopRecord',
  'onVoiceRecordEnd',
  'playVoice',
  'onVoicePlayEnd',
  'pauseVoice',
  'stopVoice',
  'uploadVoice',
  'downloadVoice',
  'chooseImage',
  'previewImage',
  'uploadImage',
  'downloadImage',
  'getNetworkType',
  'openLocation',
  'getLocation',
  'hideOptionMenu',
  'showOptionMenu',
  'closeWindow',
  'scanQRCode',
  'chooseWXPay',
  'openProductSpecificView',
  'addCard',
  'chooseCard',
  'openCard',
] as const;

export type WxApiList = typeof WX_JS_API_LIST;

/**
 * 获取微信JS-SDK配置并初始化
 * @param jsApiList 需要使用的JS接口列表，默认使用WX_JS_API_LIST
 * @returns Promise<void>
 */
export async function getWxConfig(
  jsApiList: WxApiList = WX_JS_API_LIST,
): Promise<void> {
  try {
    const { result } = await api.wxConfig.getWxConfig<WxConfigResponse>();

    if (!result?.appId) {
      throw new Error('微信配置获取失败');
    }

    const { appId, timestamp, nonceStr, signature } = result;

    window?.wx?.config({
      debug: false, // 关闭调试模式
      appId, // 公众号的唯一标识
      timestamp, // 生成签名的时间戳
      nonceStr, // 生成签名的随机串
      signature, // 签名
      jsApiList, // 需要使用的JS接口列表
    });
  } catch (error) {
    console.error('微信JS-SDK配置失败:', error);
    throw error;
  }
}
