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
@Get('short-info')
  async findAllShortInfo() {
    return this.eventService.findAllShortInfo();
  }
@Get('with-details')
async findAllWithDetails() {
  return this.eventService.findAllWithDetails()
}
@Get('allsponsors/exhibitors')
async fetchAll() {
  return this.eventService.getAllSponsorsAndExhibitors()
}


  @Get('admin-all')
  findAll() {
    return this.eventService.findAll();
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

 @Get('summary/mapview')
  async getEventSummary() {
    return this.eventService.getEventSummary()
  }


@Post('toggle-registration')
toggleRegistration(@Body() body) {
  return this.eventService.toggleRegistration(body.eventId, body.userId)
}

@Get('registration-status/:eventId/:userId')
registrationStatus(
  @Param('eventId', ParseIntPipe) eventId: number,
  @Param('userId', ParseIntPipe) userId: number
) {
  return this.eventService.registrationStatus(eventId, userId)
}

@Get('check-first-registration/:eventId/:userId')
checkFirstRegistration(
  @Param('eventId', ParseIntPipe) eventId: number,
  @Param('userId', ParseIntPipe) userId: number
) {
  return this.eventService.checkFirstRegistration(eventId, userId)
}




}
