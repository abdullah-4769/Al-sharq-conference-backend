import { Controller, Post, Body, Get, Param, ParseIntPipe } from '@nestjs/common';
import { ParticipantsService } from './participants.service';

@Controller('participants')
export class ParticipantsController {
  constructor(private participantsService: ParticipantsService) {}

  @Post('agenda')
  async addToAgenda(
    @Body() body: { userId: number; sessionId: number; eventId: number },
  ) {
    return this.participantsService.addToAgenda(
      body.userId,
      body.sessionId,
      body.eventId,
    );
  }

  @Get('user/:userId')
  getByUserId(@Param('userId', ParseIntPipe) userId: number) {
    return this.participantsService.getByUserId(userId);
  }

  @Get('event/:eventId')
  getByEventId(@Param('eventId', ParseIntPipe) eventId: number) {
    return this.participantsService.getByEventId(eventId);
  }

  @Get('session/:sessionId')
  getBySessionId(@Param('sessionId', ParseIntPipe) sessionId: number) {
    return this.participantsService.getBySessionId(sessionId);
  }

@Get('all-sessions/:userId')
async getAllSessions(@Param('userId', ParseIntPipe) userId: number) {
  return this.participantsService.getAllSessionsWithBookmarkAndLive(userId)
}

  


}
