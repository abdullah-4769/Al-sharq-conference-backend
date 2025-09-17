import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../../lib/prisma/prisma.service'
import { CreateParticipantDirectoryDto } from './dto/create-participant-directory.dto'
import { UpdateParticipantDirectoryDto } from './dto/update-participant-directory.dto'

@Injectable()
export class ParticipantDirectoryService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateParticipantDirectoryDto) {
    const user = await this.prisma.user.findUnique({ where: { id: dto.userId } })
    if (!user) throw new NotFoundException(`User ${dto.userId} not found`)

    if (dto.eventId) {
      const event = await this.prisma.event.findUnique({ where: { id: dto.eventId } })
      if (!event) throw new NotFoundException(`Event ${dto.eventId} not found`)
    }

    if (dto.sessionId) {
      const session = await this.prisma.session.findUnique({ where: { id: dto.sessionId } })
      if (!session) throw new NotFoundException(`Session ${dto.sessionId} not found`)
    }

    return this.prisma.participantDirectory.create({
      data: {
        userId: dto.userId,
        eventId: dto.eventId,
        sessionId: dto.sessionId,
        optedIn: dto.optedIn ?? false,
      },
    })
  }

  async getStatus(eventId: number | null, userId: number) {
    const record = await this.prisma.participantDirectory.findFirst({
      where: { userId, eventId },
    })
    if (!record) throw new NotFoundException(`Record not found`)
    return record
  }

  async updateStatus(eventId: number, userId: number, dto: UpdateParticipantDirectoryDto) {
    const record = await this.prisma.participantDirectory.findFirst({
      where: { userId, eventId },
    })
    if (!record) throw new NotFoundException(`Record not found`)

    return this.prisma.participantDirectory.update({
      where: { id: record.id },
      data: { optedIn: dto.optedIn },
    })
  }

  async getOptedInParticipants(eventId: number) {
    return this.prisma.participantDirectory.findMany({
      where: { eventId, optedIn: true },
      select: {
        user: { select: { id: true, name: true, role: true, file: true } },
      },
    })
  }


async getOptedInBySession(sessionId: number) {
  return this.prisma.participantDirectory.findMany({
    where: { sessionId, optedIn: true }, // only fetch optedIn = true
    include: {
      user: { select: { id: true, name: true, role: true, file: true } },
    },
  });
}



async getSessionStatus(sessionId: number, userId: number) {
  const participants = await this.prisma.participantDirectory.findMany({
    where: { sessionId },
    include: {
      user: { select: { id: true, name: true, role: true, file: true } },
    },
  })

  const others = participants.filter(p => p.userId !== userId)

  const result = await Promise.all(
    others.map(async record => {
      const connection = await this.prisma.connectionRequest.findFirst({
        where: {
          OR: [
            { senderId: userId, receiverId: record.userId, status: 'ACCEPTED' },
            { senderId: record.userId, receiverId: userId, status: 'ACCEPTED' },
          ],
        },
      })

      return {
        user: record.user,
        isFriend: !!connection,
      }
    })
  )

  return result
}




}
