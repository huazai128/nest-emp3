export interface TokenInfo {
  accessToken: string;
  expiresIn: number;
}

export interface UserInfo {
  userId: number;
  openid?: string;
  nickname?: string;
  avatar?: string;
  role?: number[];
  account?: string;
}

export interface AuthInfo {
  user: UserInfo;
  token: TokenInfo;
}
