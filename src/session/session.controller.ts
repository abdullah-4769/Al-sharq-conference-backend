import { Controller, Get, Post, Body, Param, Patch, Delete ,ParseIntPipe} from '@nestjs/common';
import { SessionService } from './session.service';
import { CreateSessionDto } from './dto/create-session.dto';
import { UpdateSessionDto } from './dto/update-session.dto';

@Controller('sessions')
export class SessionController {
  constructor(private readonly sessionService: SessionService) {}

  @Post()
  create(@Body() data: CreateSessionDto) {
    return this.sessionService.create(data);
  }

  @Get()
  findAll() {
    return this.sessionService.findAll();
  }

  @Get('detail/:id')
  findOne(@Param('id') id: string) {
    return this.sessionService.findOne(Number(id));
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() data: UpdateSessionDto) {
    return this.sessionService.update(Number(id), data);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.sessionService.remove(Number(id));
  }

@Get('event/:eventId/sessions')
async getSessionsByEvent(@Param('eventId', ParseIntPipe) eventId: number) {
  return this.sessionService.findRelatedSessionsByEvent(eventId)
}
@Get('speaker/:speakerId')
async getSessionsBySpeaker(@Param('speakerId', ParseIntPipe) speakerId: number) {
  return this.sessionService.findSessionsBySpeaker(speakerId)
}


  @Get('all')
  async getAllSessions() {
    return this.sessionService.findAllSessions()
  }
  @Get('simple/:id')
  getSession(@Param('id', ParseIntPipe) id: number) {
    return this.sessionService.findSessionById(id)
  }

 @Get(':sessionId/user-status/:userId')
  async getUserSessionStatus(
    @Param('sessionId', ParseIntPipe) sessionId: number,
    @Param('userId', ParseIntPipe) userId: number,
  ) {
    return this.sessionService.getUserSessionStatus(sessionId, userId);
  }


}



