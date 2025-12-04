import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common'
import { PrismaService } from '../lib/prisma/prisma.service'
import { BrevoService } from '../brevo/brevo.service'
import { CreateAnnouncementDto } from './dto/create-announcement.dto'
import { UpdateAnnouncementDto } from './dto/update-announcement.dto'

@Injectable()
export class AnnouncementService {
  constructor(private prisma: PrismaService, private brevoService: BrevoService) {}

  async create(dto: CreateAnnouncementDto) {
    const announcement = await this.prisma.announcement.create({
      data: {
        title: dto.title,
        message: dto.message,
        roles: dto.roles,
        scheduledAt: dto.scheduledAt ? new Date(dto.scheduledAt) : null,
        isSent: false,
      },
    })

    if (dto.sendNow && !dto.scheduledAt) {
      await this.sendAnnouncement(announcement.id)
    }

    return announcement
  }

  async update(id: number, dto: UpdateAnnouncementDto) {
    const announcement = await this.prisma.announcement.findUnique({ where: { id } })
    if (!announcement) throw new NotFoundException('Announcement not found')
    if (announcement.isSent) throw new BadRequestException('Announcement already sent and cannot be updated')

    const updated = await this.prisma.announcement.update({ where: { id }, data: dto })

    if (dto.sendNow && !updated.isSent) {
      await this.sendAnnouncement(id)
    }

    return updated
  }

  async sendAnnouncement(id: number) {
    const announcement = await this.prisma.announcement.findUnique({ where: { id } })
    if (!announcement) throw new NotFoundException('Announcement not found')
    if (announcement.isSent) throw new BadRequestException('Announcement already sent')

    let users;
    if (announcement.roles.includes('all')) {
      users = await this.prisma.user.findMany()
    } else {
      users = await this.prisma.user.findMany({ where: { role: { in: announcement.roles } } })
    }

    for (const user of users) {
      try {
        await this.brevoService.sendEmail(user.email, announcement.title, announcement.message)
      } catch (err: any) {
        console.error(`Failed to send to ${user.email}: ${err.message}`)
      }
    }

    await this.prisma.announcement.update({ where: { id }, data: { isSent: true } })

    return { sentTo: users.length }
  }

  async getAll() {
    return this.prisma.announcement.findMany({ orderBy: { createdAt: 'desc' } })
  }

  async delete(id: number) {
    const announcement = await this.prisma.announcement.findUnique({ where: { id } })
    if (!announcement) throw new NotFoundException('Announcement not found')
    return this.prisma.announcement.delete({ where: { id } })
  }
}
