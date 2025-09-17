import { Controller, Post, Body, Get, Param, ParseIntPipe } from '@nestjs/common'
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
}
