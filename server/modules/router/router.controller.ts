import { Controller, Get, Render, Header, Req } from '@nestjs/common';
import { Request } from 'express';
import { RouterService } from './router.service'; // Ensure correct service name
import { createLogger } from '@app/utils/logger';
import { detectUserAgent } from './router.utile';

const logger = createLogger({
  scope: 'RouterController',
  time: true,
});

/**
 * 路由控制器
 * 处理页面路由和渲染
 */
@Controller()
export class RouterController {
  constructor(private readonly routeService: RouterService) {} // Ensure correct service name

  /**
   * 通用处理逻辑
   * 获取访问链接和公共数据
   * @param {Request} req - 请求对象
   * @returns {Object} 返回包含公共数据和访问路径的对象
   */
  private async getCommonData(req: Request) {
    const accessUrl = req.protocol + '://' + req.get('host') + req.originalUrl;
    logger.log('访问的连接:', accessUrl);

    // 获取公共数据
    const wechatLoginUrl =
      await this.routeService.generateWechatLoginUrl(accessUrl);
    const commonData = this.routeService.getCommonData(req);
    logger.log('通用数据', commonData);

    const { isWx, isApp, isIOS, isAndroid } = detectUserAgent(req);

    return {
      data: {
        ...commonData,
        path: req.url, // 当前访问路径
        wechatLoginUrl,
        isWx,
        isApp,
        isIOS,
        isAndroid,
      },
    };
  }

  /**
   * 登录页面路由
   * 渲染登录页面模板
   * @returns {Object} 返回渲染数据
   */
  @Get('login')
  @Header('content-type', 'text/html') // 设置响应头为HTML
  @Render('index') // 使用index模板渲染
  login() {
    logger.info('login');
    return { data: { name: '登录页面' } };
  }

  /**
   * 错误页面路由
   * 渲染错误页面模板
   * @returns {Object} 返回渲染数据
   */
  @Get('error')
  @Header('content-type', 'text/html') // 设置响应头为HTML
  @Render('error') // 使用error模板渲染
  getError() {
    return { msg: '1212' }; // 返回错误信息
  }

  /**
   * 渲染站点页面
   * @param {Request} req - 请求对象
   * @returns {Object} 返回渲染数据
   */
  @Get('site')
  @Header('content-type', 'text/html')
  @Render('pages/site')
  async site(@Req() req: Request) {
    return this.getCommonData(req); // Reuse common data logic
  }

  /**
   * 渲染分享页面
   * @param {Request} req - 请求对象
   * @returns {Object} 返回渲染数据
   */
  @Get('share/*')
  @Header('content-type', 'text/html')
  @Render('pages/share')
  async share(@Req() req: Request) {
    return this.getCommonData(req); // Reuse common data logic
  }

  /**
   * 渲染活动页面
   * @param {Request} req - 请求对象
   * @returns {Object} 返回渲染数据
   */
  @Get('activity')
  @Header('content-type', 'text/html')
  @Render('pages/activity')
  async activity(@Req() req: Request) {
    return this.getCommonData(req); // Reuse common data logic
  }

  /**
   * 通用页面路由
   * 渲染页面模板
   * @param {Request} req - 请求对象
   * @returns {Object} 返回渲染数据
   */
  @Get('*')
  @Header('content-type', 'text/html')
  @Render('index')
  async common(@Req() req: Request) {
    return this.getCommonData(req); // Reuse common data logic
  }
}
