import { IsString, IsUrl } from 'class-validator';

export class CreateShortenedLinkDto {
  @IsString()
  @IsUrl()
  link: string;
}
