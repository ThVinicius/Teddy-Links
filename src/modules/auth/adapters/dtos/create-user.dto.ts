import { Transform } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class CreateUserDto {
  @Transform(({ value }) => String(value).trim())
  @IsString()
  @IsNotEmpty()
  name: string;

  @Transform(({ value }) => String(value).trim())
  @IsEmail()
  email: string;

  @Transform(({ value }) => String(value).trim())
  @IsString()
  @IsNotEmpty()
  password: string;
}
