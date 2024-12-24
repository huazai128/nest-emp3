import { Controller, Get, Render, Header, Query } from '@nestjs/common';
import { Request } from 'express';
import { RouterSercive } from './router.service';

@Controller()
export class RouterController {
  constructor(private readonly routeService: RouterSercive) {}
  /**
   * 渲染页面
   * @param {Request} req
   * @return {*}
   * @memberof AppController
   */
  @Get('login')
  @Header('content-type', 'text/html')
  @Render('index')
  login(@Query() req: Request) {
    return { data: { name: '登录页面' } };
  }

  /**
   * 错误页面
   * @return {*}
   * @memberof AppController
   */
  @Get('error')
  @Header('content-type', 'text/html')
  @Render('error')
  getError() {
    return { msg: '1212' };
  }
}
