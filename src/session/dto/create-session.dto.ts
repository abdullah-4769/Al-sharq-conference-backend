import {
  IsString,
  IsOptional,
  IsInt,
  IsArray,
  IsDateString,
  IsBoolean,
  ArrayNotEmpty,
} from 'class-validator'

export class CreateSessionDto {
  @IsString()
  title: string

  @IsOptional()
  @IsString()
  description?: string

  @IsDateString()
  startTime: string

  @IsDateString()
  endTime: string

  @IsOptional()
  @IsString()
  location?: string

  @IsOptional()
  @IsString()
  category?: string

  @IsOptional()
  @IsInt()
  capacity?: number

  @IsOptional()
  @IsArray()
  tags?: string[]

  @IsInt()
  eventId: number

  @IsOptional()
  @IsArray()
  @ArrayNotEmpty()
  speakerIds?: number[]

  @IsOptional()
  @IsBoolean()
  isActive?: boolean

  @IsOptional()
  @IsBoolean()
  registrationRequired?: boolean
}
