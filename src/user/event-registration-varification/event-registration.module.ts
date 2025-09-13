import { Module } from '@nestjs/common';
import { EventRegistrationService } from './event-registration.service';
import { EventRegistrationController } from './event-registration.controller';
import { PrismaService } from '../../lib/prisma/prisma.service';

@Module({
  controllers: [EventRegistrationController],
  providers: [EventRegistrationService, PrismaService],
})
export class EventRegistrationModule {}
