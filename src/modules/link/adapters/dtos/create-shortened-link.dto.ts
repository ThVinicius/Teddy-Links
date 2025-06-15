import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUrl } from 'class-validator';

export class CreateShortenedLinkDto {
  @ApiProperty({
    description: 'A URL original completa que você deseja encurtar.',
    example: 'https://www.google.com/search?q=nestjs+e+swagger'
  })
  @IsString()
  @IsUrl()
  link: string;
}
