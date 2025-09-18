import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../lib/prisma/prisma.service'
import { CreateSessionDto } from './dto/create-session.dto'
import { UpdateSessionDto } from './dto/update-session.dto'
import { JwtService } from '../lib/jwt/jwt.service'

@Injectable()
export class SessionService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async create(data: CreateSessionDto) {
    const event = await this.prisma.event.findUnique({ where: { id: data.eventId } })
    if (!event) throw new NotFoundException(`Event with id ${data.eventId} not found`)

    if (data.speakerIds?.length) {
      const speakers = await this.prisma.speaker.findMany({
        where: { id: { in: data.speakerIds } },
        select: { id: true },
      })
      const foundIds = speakers.map(s => s.id)
      const missing = data.speakerIds.filter(id => !foundIds.includes(id))
      if (missing.length) throw new NotFoundException(`Speakers not found: ${missing.join(', ')}`)
    }

    const session = await this.prisma.session.create({
      data: {
        title: data.title,
        description: data.description,
        startTime: new Date(data.startTime),
        endTime: new Date(data.endTime),
        location: data.location,
        category: data.category,
        capacity: data.capacity,
        tags: data.tags,
        eventId: data.eventId,
        isActive: data.isActive ?? true,
        registrationRequired: data.registrationRequired ?? false,
        speakers: data.speakerIds ? { connect: data.speakerIds.map(id => ({ id })) } : undefined,
      },
      include: {
        speakers: { include: { user: true } },
        event: true,
      },
    })

    const now = Date.now()
    const end = new Date(session.endTime).getTime()
    const expiresInSeconds = Math.max(Math.floor((end - now) / 1000), 0)

    const token = this.jwtService.sign({ sessionId: session.id }, { expiresIn: expiresInSeconds })

    const updatedSession = await this.prisma.session.update({
      where: { id: session.id },
      data: { joinToken: token },
      include: {
        speakers: { include: { user: true } },
        event: true,
      },
    })

    return updatedSession
  }

  async findAll() {
    return this.prisma.session.findMany({
      include: {
        speakers: { include: { user: true } },
        event: true,
        participants: { include: { user: true } },
      },
    })
  }

async findOne(id: number) {
  const session = await this.prisma.session.findUnique({
    where: { id },
    include: {
      speakers: { include: { user: true } },
      event: true,
      sessionRegistrations: { include: { user: true } },
    },
  })
  if (!session) throw new NotFoundException(`Session with id ${id} not found`)

  const registeredUsers = session.sessionRegistrations.map(reg => reg.user)
  const registrationCount = registeredUsers.length

  const { sessionRegistrations, ...sessionData } = session

  return {
    ...sessionData,
    registeredUsers,
    registrationCount,
  }
}


  async update(id: number, data: UpdateSessionDto) {
    const session = await this.prisma.session.findUnique({ where: { id } })
    if (!session) throw new NotFoundException(`Session with id ${id} not found`)

    if (data.speakerIds?.length) {
      const speakers = await this.prisma.speaker.findMany({
        where: { id: { in: data.speakerIds } },
        select: { id: true },
      })
      const foundIds = speakers.map(s => s.id)
      const missing = data.speakerIds.filter(id => !foundIds.includes(id))
      if (missing.length) throw new NotFoundException(`Speakers not found: ${missing.join(', ')}`)
    }

    return this.prisma.session.update({
      where: { id },
      data: {
        ...data,
        startTime: data.startTime ? new Date(data.startTime) : undefined,
        endTime: data.endTime ? new Date(data.endTime) : undefined,
        registrationRequired: data.registrationRequired ?? session.registrationRequired,
        speakers: data.speakerIds ? { set: data.speakerIds.map(id => ({ id })) } : undefined,
      },
      include: {
        speakers: { include: { user: true } },
        event: true,
        participants: { include: { user: true } },
      },
    })
  }

  async remove(id: number) {
    const session = await this.prisma.session.findUnique({ where: { id } })
    if (!session) throw new NotFoundException(`Session with id ${id} not found`)

    await this.prisma.session.delete({ where: { id } })
    return { message: 'Session deleted successfully' }
  }

async findRelatedSessionsSimple(sessionId: number) {
  const session = await this.prisma.session.findUnique({
    where: { id: sessionId },
  })
  if (!session) throw new NotFoundException(`Session with id ${sessionId} not found`)

  const relatedSessions = await this.prisma.session.findMany({
    where: {
      eventId: session.eventId,
      NOT: { id: sessionId },
    },
    include: {
      speakers: {
        include: {
          user: {
            select: { name: true, file: true } // include file
          }
        }
      }
    },
  })

  return relatedSessions.map(s => ({
    id: s.id,
    eventId: s.eventId, // added eventId
    title: s.title,
    description: s.description,
    startTime: s.startTime,
    endTime: s.endTime,
    location: s.location,
    category: s.category,
    capacity: s.capacity,
    speakers: s.speakers.map(sp => ({
      name: sp.user.name,
      photo: sp.user.file // map file to photo
    }))
  }))
}



}
