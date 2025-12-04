import { Injectable } from '@nestjs/common'
import { Cron } from '@nestjs/schedule'
import { PrismaService } from '../lib/prisma/prisma.service'
import { AnnouncementService } from './announcement.service'

@Injectable()
export class SchedulerService {
  constructor(private prisma: PrismaService, private announcementService: AnnouncementService) {}

  @Cron('*/1 * * * *') // every 1 minute
  async checkScheduledAnnouncements() {
    const now = new Date()
    const announcements = await this.prisma.announcement.findMany({
      where: { scheduledAt: { lte: now }, isSent: false },
    })

    for (const announcement of announcements) {
      await this.announcementService.sendAnnouncement(announcement.id)
    }
  }
}
