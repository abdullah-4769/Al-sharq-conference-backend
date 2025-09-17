import { Controller, Post, Get, Put, Body, Param, ParseIntPipe } from '@nestjs/common'
import { ParticipantDirectoryService } from './participant-directory.service'
import { CreateParticipantDirectoryDto } from './dto/create-participant-directory.dto'
import { UpdateParticipantDirectoryDto } from './dto/update-participant-directory.dto'

@Controller('participant-directory-opt-in-out')
export class ParticipantDirectoryController {
  constructor(private readonly service: ParticipantDirectoryService) {}

  @Post()
  create(@Body() dto: CreateParticipantDirectoryDto) {
    return this.service.create(dto)
  }

  @Get(':eventId/:userId')
  getStatus(
    @Param('eventId', ParseIntPipe) eventId: number,
    @Param('userId', ParseIntPipe) userId: number,
  ) {
    return this.service.getStatus(eventId, userId)
  }

  @Put(':eventId/:userId')
  updateStatus(
    @Param('eventId', ParseIntPipe) eventId: number,
    @Param('userId', ParseIntPipe) userId: number,
    @Body() dto: UpdateParticipantDirectoryDto,
  ) {
    return this.service.updateStatus(eventId, userId, dto)
  }

  @Get('opted-in/:eventId')
  async getOptedIn(@Param('eventId', ParseIntPipe) eventId: number) {
    const participants = await this.service.getOptedInParticipants(eventId)
    return participants.map(p => p.user) 
  }

@Get('opted-in/session/:sessionId')
async getOptedInBySession(@Param('sessionId', ParseIntPipe) sessionId: number) {
  const participants = await this.service.getOptedInBySession(sessionId);
  return participants.map(p => p.user);
}



@Get('session/:sessionId/:userId')
async getSessionStatus(
  @Param('sessionId', ParseIntPipe) sessionId: number,
  @Param('userId', ParseIntPipe) userId: number,
) {
  return this.service.getSessionStatus(sessionId, userId);
}




}
