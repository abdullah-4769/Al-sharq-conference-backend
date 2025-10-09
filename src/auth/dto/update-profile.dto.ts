import { IsEmail, IsOptional, IsString } from 'class-validator'

export class UpdateProfileDto {
  @IsOptional()
  @IsEmail()
  email?: string

  @IsOptional()
  @IsString()
  name?: string

  @IsOptional()
  @IsString()
  organization?: string
}
