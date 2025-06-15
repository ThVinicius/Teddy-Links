import { ApiProperty } from '@nestjs/swagger';
import { Credentials } from '../../application/types/credentials.type';

export class CredentialsDocs implements Credentials {
  @ApiProperty({
    description:
      'O token de acesso JWT (JSON Web Token) para autenticação do usuário.',
    example:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c'
  })
  access_token: string;

  @ApiProperty({
    description: 'O tipo do token. Para JWT, o padrão é "Bearer".',
    example: 'Bearer'
  })
  token_type: string;

  @ApiProperty({
    description: 'O tempo de vida do token de acesso em segundos.',
    example: 3600
  })
  expires_in: number;
}
