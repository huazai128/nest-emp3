/**
 * 路由与域名映射关系
 * 用于微信授权时,不同页面对应不同的授权域名，
 * 这样方便管理，比如商城页面使用商城域名授权，活动页面使用活动域名授权，用户中心使用主域名授权
 */
export const ROUTE_DOMAIN_MAP = new Map<string, string>([
  // 示例: 商城页面使用商城域名授权
  // ['/', '192.168.31.211:3003'],
  // 示例: 活动页面使用活动域名授权
  ['/activity', 'activity.example.com'],
  // 示例: 用户中心使用主域名授权
  ['/user', 'www.example.com'],
]);

/**
 * 微信静默授权路由数组
 * 用于存储所有需要微信静默授权的路由路径，这里配置的是页面路由
 */
export const WECHAT_SILENT_AUTH_ROUTES: string[] = [];

/**
 * 微信已登录静默授权路由数组
 * 用于存储所有已登录并且访问时需要静默授权的路由路径
 */
export const WECHAT_LOGGED_IN_SILENT_AUTH_ROUTES = ['/profile', '/settings'];
