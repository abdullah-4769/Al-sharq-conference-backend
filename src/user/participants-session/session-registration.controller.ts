import { Controller, Post, Body, Get, Param, Query,ParseIntPipe } from '@nestjs/common'
import { SessionRegistrationService } from './session-registration.service'
import { CreateSessionRegistrationDto } from './dto/create-session-registration.dto'
import { VerifyJoinCodeDto } from './dto/verify-join-code.dto'

@Controller('participants-session')
export class SessionRegistrationController {
  constructor(private service: SessionRegistrationService) {}

  @Post('registration')
  async register(@Body() dto: CreateSessionRegistrationDto) {
    return this.service.register(dto)
  }

  @Post('joining-verify')
  async verify(@Body() dto: VerifyJoinCodeDto) {
    return this.service.verifyCode(dto)
  }

  @Get('by-session/:sessionId')
  async getBySession(@Param('sessionId', ParseIntPipe) sessionId: number) {
    return this.service.getBySession(sessionId)
  }

  @Get('all-registrations')
  async getAll() {
    return this.service.getAllRegistrations()
  }

  @Get('joined-participants')
  async getAllJoinedParticipants() {
    return this.service.getAllJoinedParticipants()
  }

  @Get('joined-participants/session/:sessionId')
  async getJoinedParticipantsBySession(@Param('sessionId', ParseIntPipe) sessionId: number) {
    return this.service.getJoinedParticipantsBySession(sessionId)
  }

@Get('/:userId/registered-sessions')
async getUserSessions(
  @Param('userId', ParseIntPipe) userId: number,
  @Query('eventId') eventId?: string // optional query param
) {
  return this.service.getSessionsByUser(userId, eventId ? parseInt(eventId) : undefined)
}



}
