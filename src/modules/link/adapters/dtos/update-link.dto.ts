import { IsInt, IsPositive, IsUrl } from 'class-validator';

export class UpdateLinkDto {
  @IsInt()
  @IsPositive()
  id: number;

  @IsUrl()
  original_url: string;
}
