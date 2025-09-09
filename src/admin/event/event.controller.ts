import { Controller, Get, Post, Body, Param, Patch, Delete, ParseIntPipe } from '@nestjs/common';
import { EventService } from './event.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';

@Controller('admin/create-event')
export class EventController {
  constructor(private readonly eventService: EventService) {}

@Post()
create(@Body() createEventDto: CreateEventDto) {
  return this.eventService.create(createEventDto);
}


  @Get()
  findAll() {
    return this.eventService.findAll();
  }
@Get('published')
findPublished() {
  return this.eventService.findPublished();
}

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.eventService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() updateEventDto: UpdateEventDto) {
    return this.eventService.update(id, updateEventDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.eventService.remove(id);
  }


}
