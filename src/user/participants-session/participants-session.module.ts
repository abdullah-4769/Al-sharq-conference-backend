import { Module } from '@nestjs/common'
import { SessionRegistrationController } from './session-registration.controller'
import { SessionRegistrationService } from './session-registration.service'
import { PrismaService } from '../../lib/prisma/prisma.service'

@Module({
  controllers: [SessionRegistrationController],
  providers: [SessionRegistrationService, PrismaService],
})
export class ParticipantsSessionModule {}
