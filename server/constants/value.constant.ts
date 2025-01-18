export const UNDEFINED = void 0;

export const NULL = null;

// 判断是否为null   value is null: 指示函数返回的布尔类型是一个类型保护
export const isNull = (value: any): value is null => value === NULL;
// 判断是否为undefined
export const isUndefined = (value: any): value is undefined =>
  value === UNDEFINED;
// 判断是否为空
export const isNil = (value: any): value is null | void =>
  isNull(value) || isUndefined(value);
