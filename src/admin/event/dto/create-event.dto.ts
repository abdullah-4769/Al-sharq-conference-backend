import { IsString, IsArray, IsDateString, IsOptional } from 'class-validator';

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

  @IsArray()
  sponsor_Ids: number[] = [];  // default empty array

  @IsArray()
  exhibitor_Ids: number[] = []; // default empty array

  @IsString()
  @IsOptional()
  status?: string;
   @IsString()
  @IsOptional()
  joinToken?: string; // draft, published, archived
}
