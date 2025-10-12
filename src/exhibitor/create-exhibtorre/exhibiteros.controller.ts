import { Controller, Get, Post, Body,UploadedFile, UseInterceptors,Patch,Delete ,Param,ParseIntPipe } from '@nestjs/common';
import { ExhibiterosService } from './exhibiteros.service';
import { CreateExhibitorDto } from './dto/create-exhibitor.dto';
import { Prisma } from '@prisma/client';
import { FileInterceptor } from '@nestjs/platform-express'

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

  @Get('event/short-info')
  async getShortInfo() {
    return this.service.getExhibitorsShortInfo();
  }


  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.service.getExhibitorById(Number(id));
  }

@Get(':id/details')
async findOneWithDetails(@Param('id', ParseIntPipe) id: number) {
  return this.service.getExhibitorWithDetails(id);
}


  @Patch(':id')
  @UseInterceptors(FileInterceptor('file'))
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: Partial<CreateExhibitorDto>,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.service.updateExhibitor(id, dto as Prisma.ExhibitorUpdateInput, file)
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.service.deleteExhibitor(Number(id));
  }


@Get(':id/sessions')
async getSessionsByExhibitor(@Param('id', ParseIntPipe) id: number) {
  return this.service.findSessionsByExhibitor(id)
}




}
