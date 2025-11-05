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

  // Remove eventId from data and handle it separately for Prisma
  const { eventId, speakerIds, ...restData } = data

  return this.prisma.session.update({
    where: { id },
    data: {
      ...restData,
      startTime: data.startTime ? new Date(data.startTime) : undefined,
      endTime: data.endTime ? new Date(data.endTime) : undefined,
      registrationRequired: data.registrationRequired ?? session.registrationRequired,
      // Use Prisma relation format for event
      event: eventId ? { connect: { id: eventId } } : undefined,
      // Use Prisma relation format for speakers
      speakers: speakerIds ? { set: speakerIds.map(id => ({ id })) } : undefined,
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

async findRelatedSessionsByEvent(eventId: number) {
  const sessions = await this.prisma.session.findMany({
    where: { eventId },
    include: {
      speakers: {
        include: {
          user: {
            select: { name: true, file: true } 
          }
        }
      }
    }
  })

  return sessions.map(s => ({
    id: s.id,
    eventId: s.eventId,
    title: s.title,
    description: s.description,
    startTime: s.startTime,
    endTime: s.endTime,
    location: s.location,
    category: s.category,
    capacity: s.capacity,
        registration: s.registrationRequired,
    speakers: s.speakers.map(sp => ({
      name: sp.user.name,
      file: sp.user.file
    }))
  }))
}



async findSessionsBySpeaker(speakerId: number) {
  const now = new Date()

  const sessions = await this.prisma.session.findMany({
    where: {
      speakers: {
        some: { id: speakerId }
      }
    },
    include: {
      speakers: {
        include: {
          user: {
            select: {
              name: true,
              file: true
            }
          }
        }
      }
    }
  })

  const total = sessions.length
  const ongoing = sessions.filter(s => new Date(s.startTime) <= now && new Date(s.endTime) >= now).length
  const scheduled = sessions.filter(s => new Date(s.startTime) > now).length

  const formattedSessions = sessions.map(session => ({
    ...session,
    speakers: session.speakers.map(sp => sp.user)
  }))

  return {
    total,
    ongoing,
    scheduled,
    sessions: formattedSessions
  }
}

 async findAllSessions() {
    const sessions = await this.prisma.session.findMany({
      include: {
        speakers: {
          include: {
            user: {
              select: { name: true, file: true }
            }
          }
        }
      }
    })

    return sessions.map(s => ({
      id: s.id,
      eventId: s.eventId,
      title: s.title,
      description: s.description,
      startTime: s.startTime,
      endTime: s.endTime,
      location: s.location,
      category: s.category,
      capacity: s.capacity,
      joinToken : s.joinToken,
      registrationRequired: s.registrationRequired,
      speakers: s.speakers.map(sp => ({
        name: sp.user.name,
        file: sp.user.file
      }))
    }))
  }

async findSessionById(id: number) {
  const session = await this.prisma.session.findUnique({
    where: { id },
    include: {
      speakers: {
        include: {
          user: {
            select: { name: true, file: true }
          }
        }
      }
    }
  })

  if (!session) throw new NotFoundException(`Session with id ${id} not found`)

  const formattedSpeakers = session.speakers.map(sp => ({
    id: sp.id,          // include speaker id
    name: sp.user.name,
    file: sp.user.file
  }))

  return {
    ...session,
    speakers: formattedSpeakers
  }
}


// session.service.ts
async getUserSessionStatus(sessionId: number, userId: number) {
  const [session, user, registration, bookmark] = await Promise.all([
    this.prisma.session.findUnique({ where: { id: sessionId } }),
    this.prisma.user.findUnique({ where: { id: userId } }),
    this.prisma.sessionRegistration.findFirst({
      where: { sessionId, userId }
    }),
    this.prisma.participant.findFirst({
      where: { sessions: { some: { id: sessionId } }, userId }
    })
  ]);

  if (!session) {
    throw new NotFoundException(`Session with id ${sessionId} not found`);
  }

  if (!user) {
    throw new NotFoundException(`User with id ${userId} not found`);
  }

  return {
    isRegistered: !!registration,
    isBookmarked: !!bookmark,
  };
}


}
