import { Controller, Get, Post, Body, Param, Patch, Delete, ParseIntPipe } from '@nestjs/common';
import { ExhibitorRepresentativeService } from './exhibitor-representative.service';
import { CreateExhibitorRepresentativeDto } from './dto/create-exhibitor-representative.dto';
import { UpdateExhibitorRepresentativeDto } from './dto/update-exhibitor-representative.dto';

@Controller('exhibitor-representatives')
export class ExhibitorRepresentativeController {
  constructor(private service: ExhibitorRepresentativeService) {}

  @Post()
  create(@Body() dto: CreateExhibitorRepresentativeDto) {
    return this.service.create(dto);
  }

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateExhibitorRepresentativeDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }

@Get('exhibitor/:exhibitorId')
getByExhibitor(@Param('exhibitorId', ParseIntPipe) exhibitorId: number) {
  return this.service.findByExhibitor(exhibitorId);
}


}
