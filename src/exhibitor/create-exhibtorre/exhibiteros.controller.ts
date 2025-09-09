import { Controller, Get, Post, Body,Put,Delete ,Param,ParseIntPipe } from '@nestjs/common';
import { ExhibiterosService } from './exhibiteros.service';
import { CreateExhibitorDto } from './dto/create-exhibitor.dto';
import { Prisma } from '@prisma/client';

@Controller('exhibiteros')
export class ExhibiterosController {
  constructor(private readonly service: ExhibiterosService) {}

  @Post()
  async create(@Body() dto: CreateExhibitorDto) {
    return this.service.createExhibitor(dto as Prisma.ExhibitorCreateInput);
  }

  @Get()
  async findAll() {
    return this.service.getAllExhibitors();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.service.getExhibitorById(Number(id));
  }

@Get(':id/details')
async findOneWithDetails(@Param('id', ParseIntPipe) id: number) {
  return this.service.getExhibitorWithDetails(id);
}

   @Put(':id')
  async update(@Param('id') id: string, @Body() dto: CreateExhibitorDto) {
    return this.service.updateExhibitor(Number(id), dto as Prisma.ExhibitorUpdateInput);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.service.deleteExhibitor(Number(id));
  }

}
