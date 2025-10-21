import { IsEmail, IsNotEmpty, IsOptional, MinLength, IsIn } from 'class-validator'

export class RegisterDto {
  @IsEmail()
  email: string

  @IsOptional()
  @MinLength(6)
  password?: string

  @IsNotEmpty()
  name: string

  @IsOptional()
  phone?: string

  @IsOptional()
  @IsIn(['participant', 'speaker', 'exhibitor', 'sponsor', 'organizer'])
  role?: string

  @IsOptional()
  organization?: string

  @IsOptional()
  photo?: string
}
