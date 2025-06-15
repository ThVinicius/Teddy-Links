import { ApiProperty } from '@nestjs/swagger';

export class BusinessErrorDocs {
  @ApiProperty({
    description: 'O código de status HTTP da resposta.'
  })
  statusCode: number;

  @ApiProperty({
    description: 'Uma mensagem legível descrevendo o erro que ocorreu.'
  })
  message: string;

  @ApiProperty({
    description: 'O nome técnico do erro de negócio.'
  })
  error: string;
}
