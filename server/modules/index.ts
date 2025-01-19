import { WechatAuthModule } from './wechatAuth/wechat-auth.module';
import { UserModule } from './user/user.module';
import { RouterModule } from './router/router.module';

// 导出模块数组，RouterModule需要放到数组最后
export default [WechatAuthModule, UserModule, RouterModule];
