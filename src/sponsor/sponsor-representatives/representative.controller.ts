import { Controller, Get, Post, Put, Delete, Param, Body, ParseIntPipe } from '@nestjs/common';
import { RepresentativeService } from './representative.service';
import { CreateRepresentativeDto } from './dto/create-representative.dto';
import { UpdateRepresentativeDto } from './dto/update-representative.dto';

@Controller('sponsor-related-representatives')
export class RepresentativeController {
  constructor(private readonly repService: RepresentativeService) {}

  @Post()
  create(@Body() dto: CreateRepresentativeDto) {
    return this.repService.createRepresentative(dto);
  }

  @Get()
  findAll() {
    return this.repService.getAllRepresentatives();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.repService.getRepresentativeById(id);
  }

  @Put(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateRepresentativeDto) {
    return this.repService.updateRepresentative(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.repService.deleteRepresentative(id);
  }

  @Get('sponsor/:sponsorId')
  findBySponsor(@Param('sponsorId', ParseIntPipe) sponsorId: number) {
    return this.repService.getRepresentativesBySponsor(sponsorId);
  }
}
