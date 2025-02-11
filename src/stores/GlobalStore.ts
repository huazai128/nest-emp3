import { create } from 'zustand';
import { combine, devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

/**
 * 全局状态存储接口定义
 */
interface GlobalStore {
  // 用户信息
  user: {
    id?: string; // 用户ID
    name?: string; // 用户名称
    avatar?: string; // 用户头像
    token?: string; // 用户令牌
  };
  isWx: boolean; // 是否微信环境
  isApp: boolean; // 是否App环境
  isDev: boolean; // 是否开发环境
  isProd: boolean; // 是否生产环境
  setUser: (user: GlobalStore['user']) => void; // 设置用户信息
  clearUser: () => void; // 清除用户信息
}

/**
 * 全局状态管理store
 * 使用zustand进行状态管理
 * 集成了devtools用于开发调试
 * 使用immer简化状态更新
 */
const globalStore = create<GlobalStore>()(
  devtools(
    immer(
      combine(
        {
          // 初始化状态,从window.INIT_DATA中获取服务端注入的数据
          user: window.INIT_DATA?.userInfo || {},
          isWx: window.INIT_DATA?.isWx || false,
          isApp: window.INIT_DATA?.isApp || false,
          isDev: window.INIT_DATA?.isDev || false,
          isProd: window.INIT_DATA?.isProd || false,
        },
        (set) => ({
          // 更新用户信息
          setUser: (user) =>
            set((state) => {
              state.user = user;
            }),
          // 清空用户信息
          clearUser: () =>
            set((state) => {
              state.user = {};
            }),
        }),
      ),
    ),
    {
      name: 'GlobalStore', // devtools中显示的store名称
    },
  ),
);

export default globalStore;
