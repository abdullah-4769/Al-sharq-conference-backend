import { Module } from '@nestjs/common'
import { AnnouncementService } from './announcement.service'
import { AnnouncementController } from './announcement.controller'
import { PrismaService } from '../lib/prisma/prisma.service'
import { BrevoService } from '../brevo/brevo.service'
import { SchedulerService } from './scheduler.service'

@Module({
  controllers: [AnnouncementController],
  providers: [AnnouncementService, PrismaService, BrevoService, SchedulerService],
})
export class AnnouncementModule {}
