export interface ILinkEntity {
  id: number;
  short_url: string;
  original_url: string;
  user_id: number;
  created_at: Date;
  updated_at: Date;
  deleted_at?: Date;
}
