import { Request } from 'express';
import { UserInfo } from './auth.interface';
import { ConfigServer } from './config.interface';
declare module 'express-session' {
  interface SessionData {
    user?: UserInfo;
  }
}

declare module 'express' {
  export interface Request {
    isLogin: boolean;
    isRouter: boolean;
  }
}

export interface AuthenticatedRequest extends Request {
  user: UserInfo;
}

export interface UnauthenticatedRequest extends Request {
  user?: UserInfo;
}

export interface HttpRequest {
  transformUrl: string;
  transferData: Record<string, any>;
  apiTransferType?: ConfigServer['apiPrefix'];
}
