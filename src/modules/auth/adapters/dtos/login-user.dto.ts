import { Transform } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginUserDto {
  @IsEmail()
  email: string;

  @Transform(({ value }) => String(value).trim())
  @IsString()
  @IsNotEmpty()
  password: string;
}
