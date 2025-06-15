import { ApiProperty } from '@nestjs/swagger';

export class UserEntityDocs {
  @ApiProperty({
    description: 'ID único do usuário no banco de dados.',
    example: 1
  })
  id: number;

  @ApiProperty({
    description: 'Nome completo do usuário.',
    example: 'João da Silva'
  })
  name: string;

  @ApiProperty({
    description: 'Endereço de e-mail único do usuário.',
    example: 'joao.silva@example.com'
  })
  email: string;

  @ApiProperty({
    description: 'Data e hora em que o usuário foi criado.',
    example: '2025-06-15T03:19:32.123Z'
  })
  created_at: Date;

  @ApiProperty({
    description: 'Data e hora da última atualização do registro do usuário.',
    example: '2025-06-15T03:19:32.123Z'
  })
  updated_at: Date;

  @ApiProperty({
    description:
      'Data e hora em que o usuário foi logicamente excluído. Fica nulo se o usuário estiver ativo.',
    example: null,
    nullable: true
  })
  deleted_at: Date;
}
