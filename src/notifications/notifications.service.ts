import { Injectable } from '@nestjs/common'
import { PrismaService } from '../lib/prisma/prisma.service'
import { CreateNotificationDto } from './dto/create-notification.dto'

@Injectable()
export class NotificationsService {
  constructor(private prisma: PrismaService) {}

async create(dto: CreateNotificationDto) {
  return this.prisma.notification.create({
    data: {
      title: dto.title,
      body: dto.body,
      url: dto.url,
      timestamp: dto.timestamp instanceof Date ? dto.timestamp : dto.timestamp ? new Date(dto.timestamp) : undefined
    }
  })
}



  async findAll() {
    return this.prisma.notification.findMany()
  }
}
