import { IsString, IsOptional, IsArray, IsDateString, IsBoolean } from 'class-validator'

export class CreateAnnouncementDto {
  @IsString()
  title: string

  @IsString()
  message: string

  @IsArray()
  roles: string[] // ['participant','speaker','all']

  @IsOptional()
  @IsDateString()
  scheduledAt?: string

  @IsOptional()
  @IsBoolean()
  sendNow?: boolean
}
