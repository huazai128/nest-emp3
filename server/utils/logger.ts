import chalk, { type Chalk } from 'chalk';

/**
 * 渲染时间戳
 * @returns 格式化的时间字符串 [YYYY/MM/DD HH:mm:ss]
 */
const renderTime = () => {
  const now = new Date();
  return `[${now.toLocaleDateString()} ${now.toLocaleTimeString()}]`;
};

/**
 * 渲染日志作用域
 * @param scope 作用域名称
 * @returns 带下划线的绿色作用域文本
 */
const renderScope = (scope: string) => {
  return chalk.green.underline(scope);
};

/**
 * 渲染日志消息
 * @param color chalk颜色函数
 * @param messages 日志消息数组
 * @returns 渲染后的消息数组
 */
const renderMessage = (color: Chalk, messages: any[]) => {
  return messages.map((m) => (typeof m === 'string' ? color(m) : m));
};

/**
 * 日志渲染器配置选项
 */
interface LoggerRenderOptions {
  consoler: (...messages: any[]) => void; // 控制台输出函数
  label: string; // 日志级别标签
  color: Chalk; // 日志颜色
  scope?: string; // 可选的作用域
  time?: boolean; // 是否显示时间戳
}

/**
 * 创建日志渲染器
 * @param options 渲染器配置选项
 * @returns 日志输出函数
 */
const renderLogger = (options: LoggerRenderOptions) => {
  return (...messages: any) => {
    const logs: any[] = [];
    logs.push(options.label);
    if (options.time) {
      logs.push(renderTime());
    }
    if (options.scope) {
      logs.push(renderScope(options.scope));
    }
    return options.consoler(...logs, ...renderMessage(options.color, messages));
  };
};

/**
 * 日志记录器配置选项
 */
export interface LoggerOptions {
  scope?: string; // 日志作用域
  time?: boolean; // 是否显示时间戳
}

/**
 * 创建日志记录器
 * @param opts 日志记录器配置选项
 * @returns 包含多个日志级别方法的日志记录器对象
 */
export const createLogger = (opts?: LoggerOptions) => ({
  // 标准日志级别
  log: renderLogger({
    label: '⚪',
    consoler: console.log,
    color: chalk.cyanBright,
    ...opts,
  }),
  info: renderLogger({
    label: '🔵',
    consoler: console.info,
    color: chalk.greenBright,
    ...opts,
  }),
  warn: renderLogger({
    label: '🟠',
    consoler: console.warn,
    color: chalk.yellowBright,
    ...opts,
  }),
  error: renderLogger({
    label: '🔴',
    consoler: console.error,
    color: chalk.redBright,
    ...opts,
  }),
  debug: renderLogger({
    label: '🟤',
    consoler: console.debug,
    color: chalk.cyanBright,
    ...opts,
  }),
  // 别名方法
  success: renderLogger({
    label: '🟢',
    consoler: console.log,
    color: chalk.greenBright,
    ...opts,
  }),
  failure: renderLogger({
    label: '🔴',
    consoler: console.warn,
    color: chalk.redBright,
    ...opts,
  }),
});

// 导出默认的日志记录器实例
export default createLogger();
