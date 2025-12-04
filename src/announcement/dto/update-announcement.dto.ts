import { IsOptional, IsString, IsArray, IsDateString, IsBoolean } from 'class-validator'

export class UpdateAnnouncementDto {
  @IsOptional()
  @IsString()
  title?: string

  @IsOptional()
  @IsString()
  message?: string

  @IsOptional()
  @IsArray()
  roles?: string[]

  @IsOptional()
  @IsDateString()
  scheduledAt?: string

  @IsOptional()
  @IsBoolean()
  sendNow?: boolean
}
