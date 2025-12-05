import { Module } from '@nestjs/common'
import { AnnouncementService } from './announcement.service'
import { AnnouncementController } from './announcement.controller'
import { PrismaService } from '../lib/prisma/prisma.service'
import { BrevoService } from '../brevo/brevo.service'
import { SchedulerService } from './scheduler.service'
import { AnnouncementCron } from '../cron/announcement.cron'
@Module({
  controllers: [AnnouncementController],
  providers: [AnnouncementService, PrismaService, BrevoService, SchedulerService, AnnouncementCron],
})
export class AnnouncementModule {}
