// 导入Typegoose的getProviderByTypegoose方法
import { getProviderByTypegoose } from '@app/transformers/model.transform';
// 导入Typegoose的AutoIncrementID插件
import { AutoIncrementID } from '@typegoose/auto-increment';
// 导入Typegoose的modelOptions, plugin, prop装饰器
import { modelOptions, plugin, prop } from '@typegoose/typegoose';
// 导入class-validator中的验证装饰器
import {
  IsDefined,
  IsOptional,
  IsString,
  IsNumber,
  IsNotEmpty,
  IsIn,
  IsArray,
  ValidateIf,
} from 'class-validator';
// 导入mongoose的分页插件
import paginate from 'mongoose-paginate-v2';

// 应用AutoIncrementID插件，用于自动递增userId字段
@plugin(AutoIncrementID, {
  field: 'userId',
  incrementBy: 1,
  startAt: 1000000000,
  trackerCollection: 'identitycounters',
  trackerModelName: 'identitycounter',
})
// 应用分页插件
@plugin(paginate)
// 设置模型选项，包括转换为对象时的选项和时间戳配置
@modelOptions({
  schemaOptions: {
    toObject: { getters: true },
    timestamps: {
      createdAt: 'create_at',
      updatedAt: 'update_at',
    },
  },
})
// 定义User类，表示用户模型
export class User {
  // 用户ID，设置唯一索引
  @prop({ unique: true })
  userId: number;

  // 用户账号，必填字段
  @IsOptional()
  @IsString()
  @prop()
  account?: string; // 账号可选

  @IsOptional()
  @IsString()
  @prop({ select: false })
  password?: string; // 密码可选

  @ValidateIf((o) => !o.openid)
  @IsNotEmpty({ message: '请输入您的账号或密码' })
  @IsString()
  @IsDefined()
  @prop({ required: true })
  openid?: string; // OpenID必填

  // 用户头像，默认为null
  @ValidateIf((o) => o.avatar !== null)
  @IsString()
  @IsOptional()
  @prop({ default: null })
  avatar?: string | null;

  // 用户角色，默认为[0]
  @ValidateIf((o) => o.role !== undefined)
  @IsArray()
  @IsNumber({}, { each: true })
  @IsOptional()
  @prop({ type: [Number], default: [0] })
  role?: number[];

  // 创建时间，默认当前时间，索引且不可变
  @prop({ default: Date.now, index: true, immutable: true })
  create_at?: Date;

  // 更新时间，默认当前时间
  @prop({ default: Date.now })
  update_at?: Date;

  // 用户昵称，可选字段
  @ValidateIf((o) => o.nickname !== undefined)
  @IsString()
  @IsOptional()
  @prop()
  nickname?: string;

  // 用户性别，默认为0
  @IsNumber()
  @IsIn([0, 1, 2], { message: '性别只能是0, 1或2' })
  @prop({ default: 0 })
  sex: number;

  // 用户语言，可选字段
  @ValidateIf((o) => o.language !== undefined)
  @IsString()
  @IsOptional()
  @prop()
  language?: string;

  // 用户所在城市，可选字段
  @ValidateIf((o) => o.city !== undefined)
  @IsString()
  @IsOptional()
  @prop()
  city?: string;

  // 用户所在省份，可选字段
  @ValidateIf((o) => o.province !== undefined)
  @IsString()
  @IsOptional()
  @prop()
  province?: string;

  // 用户所在国家，可选字段
  @ValidateIf((o) => o.country !== undefined)
  @IsString()
  @IsOptional()
  @prop()
  country?: string;

  // 用户头像URL，可选字段
  @ValidateIf((o) => o.headimgurl !== undefined)
  @IsString()
  @IsOptional()
  @prop()
  headimgurl?: string;

  // 用户特权信息，默认为空数组
  @IsArray()
  @IsString({ each: true })
  @prop({ type: () => [String], default: [] })
  privilege: string[];
}

// 获取User模型的提供者
export const UserProvider = getProviderByTypegoose(User);
