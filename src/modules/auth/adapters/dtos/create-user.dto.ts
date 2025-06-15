import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({
    description: 'Nome completo do usuário. Não pode ser vazio.',
    example: 'João da Silva'
  })
  @Transform(({ value }) => String(value).trim())
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Endereço de e-mail do usuário, que será usado para login.',
    example: 'joao.silva@example.com'
  })
  @Transform(({ value }) => String(value).trim())
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'Senha para a criação da conta. Não pode ser vazia.',
    example: 'S3nh@F0rt3!2025',
    format: 'password'
  })
  @Transform(({ value }) => String(value).trim())
  @IsString()
  @IsNotEmpty()
  password: string;
}
