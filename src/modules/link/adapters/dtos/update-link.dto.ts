import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsPositive, IsUrl } from 'class-validator';

export class UpdateLinkDto {
  @ApiProperty({
    description: 'O ID numérico do link que você deseja atualizar.',
    example: 123
  })
  @IsInt()
  @IsPositive()
  id: number;

  @ApiProperty({
    description: 'A nova URL de destino para a qual o link deve redirecionar.',
    example: 'https://docs.nestjs.com/openapi/introduction'
  })
  @IsUrl()
  original_url: string;
}
