import { Connection as MongodbConnection } from 'mongoose';
import { Inject, Provider } from '@nestjs/common';
import {
  REPOSITORY,
  DB_CONNECTION_TOKEN,
} from '@app/constants/system.constant';
import { getModelForClass } from '@typegoose/typegoose';

export interface TypeClass {
  new (...args: any[]): any; // 使用更通用的类型定义
}

// 获取provider名称
export function getModelName(name: string): string {
  return `${name.toLocaleUpperCase()}${REPOSITORY}`; // 使用模板字符串优化字符串拼接
}

// 获取mongodb工厂提供者
export function getProviderByTypegoose(typegooseClass: TypeClass): Provider {
  return {
    provide: getModelName(typegooseClass.name),
    useFactory: (connection: MongodbConnection) =>
      getModelForClass(typegooseClass, { existingConnection: connection }), // 省略return关键字
    inject: [DB_CONNECTION_TOKEN],
  };
}

// Model注入器
export function InjectModel(model: TypeClass) {
  return Inject(getModelName(model.name));
}
