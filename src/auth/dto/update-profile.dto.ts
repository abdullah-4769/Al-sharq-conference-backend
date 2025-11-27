import { IsOptional, IsString, IsPhoneNumber } from 'class-validator'

export class UpdateProfileDto {
@IsOptional()
@IsPhoneNumber(undefined)
phone?: string


  @IsOptional()
  @IsString()
  name?: string

  @IsOptional()
  @IsString()
  organization?: string

  @IsOptional()
  @IsString()
  bio?: string
}
