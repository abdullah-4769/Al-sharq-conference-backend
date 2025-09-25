import { Controller, Get, Post, Body, Param, Patch, Delete, ParseIntPipe } from '@nestjs/common';
import { EventService } from './event.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';

@Controller('event')
export class EventController {
  constructor(private readonly eventService: EventService) { }

  @Post()
  create(@Body() createEventDto: CreateEventDto) {
    return this.eventService.create(createEventDto);
  }

@Get('with-details')
async findAllWithDetails() {
  return this.eventService.findAllWithDetails()
}


  @Get('admin-all')
  findAll() {
    return this.eventService.findAll();
  }


@Get('short-info')
  async findAllShortInfo() {
    return this.eventService.findAllShortInfo();
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
  // controller
@Get('event-sessions/:eventId')
async getEventSessions(@Param('eventId', ParseIntPipe) eventId: number) {
  return this.eventService.getAllEventSessions(eventId)
}


 @Get('eventsrelatedsponsers/:eventId')
  async fetchByEvent(@Param('eventId', ParseIntPipe) eventId: number) {
    return this.eventService.getSponsorsAndExhibitorsByEvent(eventId);
  }


}
