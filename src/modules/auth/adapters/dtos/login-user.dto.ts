import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginUserDto {
  @ApiProperty({
    description: 'Endereço de e-mail do usuário para login.',
    example: 'joao.silva@example.com'
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'Senha do usuário. Não pode ser vazia.',
    example: 'S3nh@F0rt3!',
    format: 'password'
  })
  @Transform(({ value }) => String(value).trim())
  @IsString()
  @IsNotEmpty()
  password: string;
}
