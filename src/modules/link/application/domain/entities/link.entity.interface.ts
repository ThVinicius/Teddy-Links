export interface ILinkEntity {
  id: number;
  short_code: string;
  original_url: string;
  user_id: number | null;
  click_count: number;
  created_at: Date;
  updated_at: Date;
  deleted_at?: Date;
}
