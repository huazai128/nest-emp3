import { isDevEnv } from '@app/configs';
import { createLogger } from '@app/utils/logger';
import { dbUrl } from 'config';
import { connection, disconnect, connect, set } from 'mongoose';

// 创建一个日志记录器实例，用于记录数据库连接相关信息
const logger = createLogger({ scope: 'databaseProviders', time: isDevEnv });

// 数据库连接令牌，用于在依赖注入中标识数据库连接
export const DB_CONNECTION_TOKEN = 'DB_CONNECTION_TOKEN';

export const databaseProviders = [
  {
    provide: DB_CONNECTION_TOKEN,
    useFactory: async () => {
      let reconnectionTask: NodeJS.Timeout | null = null; // 使用更具体的类型
      const RECONNECT_INTERVAL = 6000; // 重新连接的时间间隔（毫秒）

      // 设置mongoose的查询模式为严格模式
      set('strictQuery', true);

      // 数据库连接函数
      async function dbConnect() {
        try {
          await connect(dbUrl);
          logger.info('mongodb数据库连接成功');
        } catch (error) {
          logger.error('数据库连接失败', error);
          throw error;
        }
      }

      // 监听数据库断开连接事件，尝试重新连接
      connection.on('disconnected', () => {
        logger.warn('数据库连接已断开，尝试重新连接');
        reconnectionTask = setTimeout(dbConnect, RECONNECT_INTERVAL);
      });

      // 监听数据库连接成功事件，清除重新连接任务
      connection.on('open', () => {
        logger.info('mongodb数据库连接成功');
        if (reconnectionTask) {
          clearTimeout(reconnectionTask);
          reconnectionTask = null;
        }
      });

      // 监听数据库连接错误事件，记录错误并断开连接
      connection.on('error', (error) => {
        logger.error('数据库连接异常', error);
        disconnect();
      });

      // 初始连接数据库
      return dbConnect();
    },
    inject: [],
  },
];
