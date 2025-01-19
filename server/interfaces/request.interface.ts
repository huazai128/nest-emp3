import { Request } from 'express';
import { UserInfo } from './user.interface';

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
