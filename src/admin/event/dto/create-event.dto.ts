import { IsString, IsArray, IsDateString, IsOptional, ValidateNested, IsInt } from 'class-validator';
import { Type } from 'class-transformer';

class SponsorRelationDto {
  @IsInt()
  id: number;
}

class ExhibitorRelationDto {
  @IsInt()
  id: number;
}

export class CreateEventDto {
  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsDateString()
  startTime: string;

  @IsDateString()
  endTime: string;

  @IsString()
  location: string;

  // Relations
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SponsorRelationDto)
  sponsors: SponsorRelationDto[] = [];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ExhibitorRelationDto)
  exhibitors: ExhibitorRelationDto[] = [];

  @IsString()
  @IsOptional()
  status?: string;

  @IsString()
  @IsOptional()
  joinToken?: string;
}
