<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://coveralls.io/github/nestjs/nest?branch=master" target="_blank"><img src="https://coveralls.io/repos/github/nestjs/nest/badge.svg?branch=master#9" alt="Coverage" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Project setup

```bash
$ yarn install
```

## Compile and run the project

```bash
# development
$ yarn run start

# watch mode
$ yarn run start:dev

# production mode
$ yarn run start:prod
```

## Run tests

```bash
# unit tests
$ yarn run test

# e2e tests
$ yarn run test:e2e

# test coverage
$ yarn run test:cov
```

## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

```bash
$ yarn install -g mau
$ mau deploy
```

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).

# Nest-EMP 多页面应用

这是一个基于 Nest.js 和 EMP (Extensible Micro Frontend Platform) 构建的多页面应用框架。

## 项目架构

### 前端架构

- 基于 EMP 的多页面应用架构
- React 18 + TypeScript
- 路由使用 React Router
- 状态管理使用 Zustand
- 样式使用 SCSS Modules
- 支持移动端适配

### 后端架构

- 基于 Nest.js 的 Node.js 服务
- MongoDB 数据库 + Mongoose ODM
- Redis 缓存
- JWT 认证
- 微信授权登录

## 目录结构

├── src/ # 前端源码
│ ├── pages/ # 页面目录
│ ├── components/ # 公共组件
│ ├── styles/ # 全局样式
│ └── utils/ # 工具函数
├── server/ # 后端源码
│ ├── modules/ # 业务模块
│ ├── middlewares/ # 中间件
│ └── processors/ # 处理器
├── templates/ # 页面模板
├── scripts/ # 脚本工具
└── dist/ # 构建输出

## 快速开始

### 环境要求

- Node.js >= 20
- MongoDB >= 4.0
- Redis >= 6.0

### 安装依赖

```bash
yarn install
```

## 开发指南

### 1. 创建新页面

使用 `create-page.sh` 脚本快速创建新页面：

```bash
yarn create-page
```

脚本功能：

- 显示可用页面模板列表
- 选择模板创建新页面
- 自动配置路由
- 生成标准页面结构

示例：

```bash
# 创建名为 share 的页面
$ yarn create-page
# 选择模板编号
# 输入页面名称: share
```

### 2. 运行开发服务

使用 `run-entry.sh` 脚本选择要运行的页面：

```bash
yarn run-entry
```

脚本功能：

- 显示所有可用页面入口
- 选择要运行的页面
- 启动开发服务器
- 支持热更新

示例：

```bash
$ yarn run-entry
# 选择入口编号
# 0: 主页
# 1: share
# 2: user
```

## 开发流程

### 1. 本地开发

```bash
# 1. 创建新页面
yarn create-page

# 2. 选择运行入口
yarn run-entry

# 3. 启动后端服务
yarn start:dev
```

### 2. 生产部署

```bash
# 1. 构建前端资源
yarn emp:build

# 2. 构建后端服务
yarn build

# 3. 启动生产服务
yarn start:prod
```

## 项目特性

### 1. 多页面支持

- 独立的页面打包
- 资源共享
- 统一的路由管理

### 2. 开发体验

- 快速创建页面
- 热更新
- TypeScript 支持
- ESLint + Prettier 代码规范

### 3. 后端能力

- RESTful API
- 微信授权
- Session 管理
- 数据库操作
- 缓存处理

### 4. 部署优化

- 按需加载
- 资源压缩
- 缓存策略
- 错误处理

## 注意事项

1. 页面创建

- 页面名称会自动转换为小写
- 路由配置会自动添加页面名称作为前缀
- 模板中的组件会自动重命名

2. 开发环境

- 需要启动 MongoDB 和 Redis
- 默认开发端口：8008(前端)、3000(后端)
- 支持环境变量配置

3. 微信相关

- 需要配置 appId 和 secret
- 支持自动授权登录
- 可配置多个授权域名

4. 部署相关

- 需要配置 nginx 反向代理
- 静态资源走 CDN
- 支持 PM2 进程管理

## 常见问题

1. 热更新不生效

- 检查 emp-config.js 配置
- 清理浏览器缓存
- 重启开发服务器

2. 页面路由问题

- 确认路由前缀正确
- 检查组件导入路径
- 验证路由配置格式

3. 微信授权失败

- 验证配置信息
- 检查域名白名单
- 查看授权日志

## 贡献指南

1. Fork 项目
2. 创建特性分支
3. 提交代码
4. 创建 Pull Request

## License

[MIT](LICENSE)
