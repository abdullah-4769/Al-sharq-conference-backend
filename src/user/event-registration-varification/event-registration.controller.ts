import { Controller, Post, Body, Get, Param,ParseIntPipe } from '@nestjs/common';
import { EventRegistrationService } from './event-registration.service';
import { CreateEventRegistrationDto } from './dto/create-event-registration.dto';
import { VerifyJoinCodeDto } from './dto/verify-join-code.dto';

@Controller('participants-event')
export class EventRegistrationController {
  constructor(private service: EventRegistrationService) {}

  @Post('registration')
  async register(@Body() dto: CreateEventRegistrationDto) {
    return this.service.register(dto);
  }

  @Post('joining-verify')
  async verify(@Body() dto: VerifyJoinCodeDto) {
    return this.service.verifyCode(dto);
  }


  
@Get('by-event/:eventId')
async getByEvent(@Param('eventId', ParseIntPipe) eventId: number) {
  return this.service.getByEvent(eventId);


}

  @Get('all-registrations')
  async getAll() {
    return this.service.getAllRegistrations();
  }


@Get('joined-participants')
async getAllJoinedParticipants() {
  return this.service.getAllJoinedParticipants();
}

@Get('joined-participants/event/:eventId')
async getJoinedParticipantsByEvent(@Param('eventId', ParseIntPipe) eventId: number) {
  return this.service.getJoinedParticipantsByEvent(eventId);
}



}
