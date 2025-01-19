export interface UserInfo {
  id: number;
  openid: string;
  nickname?: string;
  avatar?: string;
  role?: number[];
  create_at?: Date;
  update_at?: Date;
}
