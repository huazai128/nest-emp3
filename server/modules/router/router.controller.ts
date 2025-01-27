import {
  Controller,
  Get,
  Render,
  Header,
  Req,
  UseGuards,
  Session,
} from '@nestjs/common';
import { Request } from 'express';
import { RouterSercive } from './router.service';
import { createLogger } from '@app/utils/logger';
import { RouterGuard } from '@app/guards/router.guard';
import { SessionData } from 'express-session';

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
  constructor(private readonly routeService: RouterSercive) {}

  /**
   * 登录页面路由
   * 渲染登录页面模板
   * @param {Request} req - 请求对象
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
    return { msg: '1212' };
  }

  /**
   * 通用页面路由
   * 渲染页面模板
   * @param {Request} req - 请求对象
   * @returns {Object} 返回渲染数据
   */
  @UseGuards(RouterGuard) // 使用路由守卫
  @Get('*')
  @Header('content-type', 'text/html')
  @Render('index')
  async common(@Req() req: Request) {
    const accessUrl = req.protocol + '://' + req.get('host') + req.originalUrl;
    logger.log('访问的连接:', accessUrl);
    // 获取公共数据
    const wechatLoginUrl =
      await this.routeService.generateWechatLoginUrl(accessUrl);
    const commonData = this.routeService.getCommonData(req);

    return {
      data: {
        ...commonData,
        path: req.url, // 当前访问路径
        wechatLoginUrl,
      },
    };
  }
}
