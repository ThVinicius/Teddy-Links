export interface ILinkEntity {
  id: number;
  short_url: string;
  original_url: string;
  created_at: Date;
  updated_at: Date;
  deleted_at?: Date;
}
