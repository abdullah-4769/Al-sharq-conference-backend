import { Controller, Post, Body, Get, Param, ParseIntPipe, Patch, Delete } from '@nestjs/common'
import { AnnouncementService } from './announcement.service'
import { CreateAnnouncementDto } from './dto/create-announcement.dto'
import { UpdateAnnouncementDto } from './dto/update-announcement.dto'

@Controller('announcements')
export class AnnouncementController {
  constructor(private service: AnnouncementService) {}

  @Post()
  create(@Body() dto: CreateAnnouncementDto) {
    return this.service.create(dto)
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateAnnouncementDto) {
    return this.service.update(id, dto)
  }

  @Get()
  getAll() {
    return this.service.getAll()
  }

  @Delete(':id')
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.service.delete(id)
  }
}
