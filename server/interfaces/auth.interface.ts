export type AuthInfo = {
  userId: number;
  account: string;
  expiresIn?: number;
};

export interface TokenInfo {
  accessToken: string;
  expiresIn: number;
}
