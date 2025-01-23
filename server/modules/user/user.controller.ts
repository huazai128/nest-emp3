import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { UserService } from './user.service';
import { createLogger } from '@app/utils/logger';

const logger = createLogger({
  scope: 'UserController',
  time: true,
});

/**
 * 用户控制器
 * 处理用户相关的请求
 */
@Controller('api/user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  /**
   * 用户登录
   * @param userData - 用户数据
   * @returns 创建的用户信息
   */
  @Post('create')
  createUser(@Body() userData: any) {
    logger.info('createUser', userData);
    // return this.userService.createUser(userData);
  }

  /**
   * 获取用户信息
   * @param userId - 用户ID
   * @returns 用户信息
   */
  @Get(':id')
  getUser(@Param('id') userId: number) {
    logger.info('getUser', userId);
    // return this.userService.getUser(userId);
  }

  /**
   * 更新用户信息
   * @param userId - 用户ID
   * @param userData - 用户数据
   * @returns 更新后的用户信息
   */
  @Post('update/:id')
  updateUser(@Param('id') userId: number, @Body() userData: any) {
    logger.info('updateUser', userId, userData);
    // return this.userService.updateUser(userId, userData);
  }
}
