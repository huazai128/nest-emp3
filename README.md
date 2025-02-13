# Nest-EMP 多页面应用架构框架

这是一个基于 Nest.js 和 EMP.js 构建的多页面应用框架, 内置微信授权登录、数据库、缓存、日志、APP端内嵌授权访问等能力。

![image](https://github.com/huazai128/nest-emp3/blob/master/image.png)

## 项目架构

### 前端架构

- 基于 EMP 微前端架构实现多页面应用
- React 18 + TypeScript
- 路由使用 React Router
- 状态管理使用 Zustand
- 样式使用 SCSS Modules
- 支持移动端适配

### 后端架构

- 基于 Nest.js 的 Node.js 服务
- MongoDB 数据库 
- Redis 缓存
- JWT 认证
- 微信授权登录

## 目录结构

```bash
├── src/ # 前端源码
│ ├── pages/ # 页面目录
│ ├── components/ # 公共组件
│ ├── hooks/ # 自定义 Hooks
│ ├── styles/ # 全局样式
│ │ ├── flex/ # 弹性布局
│ │ └── reset/ # 样式重置
│ ├── services/ # 服务层
│ └── utils/ # 工具函数
├── server/ # 后端源码
│ ├── modules/ # 业务模块
│ ├── middlewares/ # 中间件
│ ├── interceptors/ # 拦截器
│ ├── filters/ # 异常过滤器
│ ├── guards/ # 守卫
│ ├── decorators/ # 装饰器
│ ├── config/ # 配置文件
│ └── utils/ # 工具函数
├── templates/ # 页面模板
│ ├── single/ # 单页面模板
│ └── multi/ # 多页面模板
├── scripts/ # 脚本工具
│ ├── create-page.sh # 创建页面脚本
│ └── run-entry.sh # 运行页面脚本
├── public/ # 静态资源
└── dist/ # 构建输出
```

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

- 资源共享
- 独立路由
- 独立状态管理
- 独立样式

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
- 日志记录
- APP 端内嵌授权访问

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
- 默认开发访问：http://*/:3003
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


