import { Injectable } from '@nestjs/common'
import { Cron } from '@nestjs/schedule'
import { PrismaService } from '../lib/prisma/prisma.service'
import { AnnouncementService } from '../announcement/announcement.service'

@Injectable()
export class AnnouncementCron {
  constructor(
    private prisma: PrismaService,
    private announcementService: AnnouncementService
  ) {}

  @Cron('* * * * *')
  async handleScheduledAnnouncements() {
    const now = new Date()
    const pending = await this.prisma.announcement.findMany({
      where: {
        isSent: false,
        scheduledAt: { not: null, lte: now },
      },
    })

    for (const announcement of pending) {
      await this.announcementService.sendAnnouncement(announcement.id)
    }
  }
}
