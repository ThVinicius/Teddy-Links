import { ApiProperty } from '@nestjs/swagger';

export class LinkEntityDocs {
  @ApiProperty({ description: 'ID numérico único do link.', example: 123 })
  id: number;

  @ApiProperty({
    description: 'O código único de 6 caracteres que forma a URL encurtada.',
    example: 'aZbKq7'
  })
  short_code: string;

  @ApiProperty({
    description: 'A URL original de destino.',
    example: 'https://www.google.com/search?q=nestjs'
  })
  original_url: string;

  @ApiProperty({
    description:
      'ID do usuário proprietário do link. É nulo para links criados anonimamente.',
    example: 42,
    nullable: true
  })
  user_id: number | null;

  @ApiProperty({
    description: 'A contagem total de cliques/acessos no link.',
    example: 150
  })
  click_count: number;

  @ApiProperty({ description: 'Data de criação do link.' })
  created_at: Date;

  @ApiProperty({ description: 'Data da última atualização do link.' })
  updated_at: Date;
}
