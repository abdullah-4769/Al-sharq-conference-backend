import { IsEmail, IsNotEmpty, IsOptional, MinLength } from 'class-validator';

export class RegisterDto {
  @IsEmail()
  email: string;

  @MinLength(6)
  password: string;

  @IsNotEmpty()
  name: string;

  @IsOptional()
  phone?: string;

  @IsOptional()
  role?: string;

  @IsOptional()
  organization?: string;

  @IsOptional()
  photo?: string;
}
