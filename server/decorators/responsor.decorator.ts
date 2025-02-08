import lodash from 'lodash';
import { reflector } from '@app/constants/reflector.constant';
import { HttpStatus, SetMetadata } from '@nestjs/common';
import { ResponseMessage } from '@app/interfaces/response.interface';
import * as META from '@app/constants/meta.constant';
import * as TEXT from '@app/constants/text.constant';
import { UNDEFINED } from '@app/constants/value.constant';

// 响应装饰器选项接口
interface ResponsorOptions extends Omit<DecoratorCreatorOption, 'usePaginate'> {
  isApi?: boolean; // 是否为API接口
  transform?: boolean; // 是否转换响应
  paginate?: boolean; // 是否分页
}

// 处理选项接口
interface HandleOption {
  error?: HttpStatus; // 错误状态码
  success?: HttpStatus; // 成功状态码
  message: ResponseMessage; // 响应消息
  usePaginate?: boolean; // 是否使用分页
}

// 处理选项配置类型
type HandleOptionConfig = ResponseMessage | HandleOption;

// 获取响应装饰器选项
export const getResponsorOptions = (target: any): ResponsorOptions => {
  return {
    isApi: reflector.get(META.HTTP_API, target),
    errorCode: reflector.get(META.HTTP_ERROR_CODE, target),
    successCode: reflector.get(META.HTTP_SUCCESS_CODE, target),
    errorMessage: reflector.get(META.HTTP_ERROR_MESSAGE, target),
    successMessage: reflector.get(META.HTTP_SUCCESS_MESSAGE, target),
    transform: reflector.get(META.HTTP_RESPONSE_TRANSFORM, target),
    paginate: reflector.get(META.HTTP_RESPONSE_TRANSFORM_TO_PAGINATE, target),
  };
};

// 装饰器创建选项接口
export interface DecoratorCreatorOption {
  useApi?: boolean; // 是否使用API
  successMessage?: ResponseMessage; // 成功消息
  successCode?: HttpStatus; // 成功状态码
  errorCode?: HttpStatus; // 错误状态码
  errorMessage?: ResponseMessage; // 错误消息
  usePaginate?: boolean; // 是否使用分页
}

// 创建装饰器函数
const createDecorator = (options: DecoratorCreatorOption): MethodDecorator => {
  const {
    useApi,
    successCode,
    successMessage,
    errorCode,
    errorMessage,
    usePaginate,
  } = options;

  return (_, __, descriptor: PropertyDescriptor) => {
    // 设置响应转换元数据
    SetMetadata(META.HTTP_RESPONSE_TRANSFORM, true)(descriptor.value);

    // 根据选项设置相应的元数据
    if (errorCode) {
      SetMetadata(META.HTTP_ERROR_CODE, errorCode)(descriptor.value);
    }
    if (successCode) {
      SetMetadata(META.HTTP_SUCCESS_CODE, successCode)(descriptor.value);
    }
    if (errorMessage) {
      SetMetadata(META.HTTP_ERROR_MESSAGE, errorMessage)(descriptor.value);
    }
    if (successMessage) {
      SetMetadata(META.HTTP_SUCCESS_MESSAGE, successMessage)(descriptor.value);
    }
    if (usePaginate) {
      SetMetadata(
        META.HTTP_RESPONSE_TRANSFORM_TO_PAGINATE,
        true,
      )(descriptor.value);
    }
    if (useApi) {
      SetMetadata(META.HTTP_API, true)(descriptor.value);
    }

    return descriptor;
  };
};

// 成功响应装饰器
export const success = (message: ResponseMessage, statusCode?: HttpStatus) => {
  return createDecorator({
    successMessage: message,
    successCode: statusCode,
  });
};

// API装饰器
export const api = (): MethodDecorator => {
  return createDecorator({ useApi: true });
};

// 分页装饰器
export const paginate = (): MethodDecorator => {
  return createDecorator({ usePaginate: true });
};

// 处理装饰器函数重载
export function handle(arg: HandleOptionConfig): MethodDecorator;
export function handle(...args): MethodDecorator {
  const option = args[0];
  // 类型守卫：判断是否为选项对象
  const isOption = (value: HandleOptionConfig): value is HandleOption =>
    lodash.isObject(value);

  // 获取消息和状态码
  const message: ResponseMessage = isOption(option) ? option.message : option;
  const errorMessage: ResponseMessage = message + TEXT.HTTP_ERROR_SUFFIX;
  const successMessage: ResponseMessage = message + TEXT.HTTP_SUCCESS_SUFFIX;
  const errorCode = isOption(option) ? option.error : UNDEFINED;
  const successCode = isOption(option) ? option.success : UNDEFINED;
  const usePaginate = isOption(option) ? option.usePaginate : false;

  // 创建并返回装饰器
  return createDecorator({
    errorCode,
    successCode,
    errorMessage,
    successMessage,
    usePaginate,
    useApi: true,
  });
}

// 导出响应装饰器对象
export const Responsor = { api, handle, success, paginate };
