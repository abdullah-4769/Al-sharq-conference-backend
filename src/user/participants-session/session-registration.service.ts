import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common'
import { PrismaService } from '../../lib/prisma/prisma.service'
import { CreateSessionRegistrationDto } from './dto/create-session-registration.dto'
import { VerifyJoinCodeDto } from './dto/verify-join-code.dto'

@Injectable()
export class SessionRegistrationService {
  constructor(private prisma: PrismaService) {}

  private async generateCode() {
    const { nanoid } = await import('nanoid')
    return nanoid(6).toUpperCase()
  }

async register(dto: CreateSessionRegistrationDto) {
  const session = await this.prisma.session.findUnique({
    where: { id: dto.sessionId },
  })

  if (!session) throw new NotFoundException('Session not found')

  // check if already registered
  const existing = await this.prisma.sessionRegistration.findFirst({
    where: {
      userId: dto.userId,
      sessionId: dto.sessionId,
    },
  })
  if (existing) {
    const currentCount = await this.prisma.sessionRegistration.count({
      where: { sessionId: dto.sessionId },
    })

    const remainingCapacity =
      session.capacity && session.capacity > 0
        ? Math.max(session.capacity - currentCount, 0)
        : null

    return {
      message: 'User already registered for this session',
      joinCode: existing.joinCode,
      token: existing.token,
      remainingCapacity,
    }
  }

  // check capacity
  let remainingCapacity: number | null = null
  if (session.capacity !== null && session.capacity > 0) {
    const currentCount = await this.prisma.sessionRegistration.count({
      where: { sessionId: dto.sessionId },
    })

    if (currentCount >= session.capacity) {
      throw new BadRequestException('Session capacity exceeded')
    }

    remainingCapacity = session.capacity - currentCount - 1
  }

  const joinCode = await this.generateCode()

  const registration = await this.prisma.sessionRegistration.create({
    data: {
      userId: dto.userId,
      eventId: dto.eventId,
      sessionId: dto.sessionId,
      name: dto.name,
      organization: dto.organization,
      email: dto.email,
      whyWantToJoin: dto.whyWantToJoin,
      relevantExperience: dto.relevantExperience,
      joinCode,
  token: session.joinToken ?? '',
    },
  })

  return { joinCode, token: session.joinToken, remainingCapacity }
}




  async verifyCode(dto: VerifyJoinCodeDto) {
    const registration = await this.prisma.sessionRegistration.findUnique({
      where: { joinCode: dto.joinCode },
      include: { session: true },
    })
    if (!registration) throw new NotFoundException('Invalid join code')

    const { userId, sessionId } = registration
    if (!userId) throw new BadRequestException('Registration missing user reference')

    const existingJoin = await this.prisma.sessionJoin.findUnique({
      where: { sessionId_userId: { sessionId, userId } },
    })
    if (existingJoin) return { message: 'User already joined this session' }

    await this.prisma.sessionJoin.create({ data: { sessionId, userId } })

    return { message: 'Join verified', session: registration.session, token: registration.token }
  }

async getAllRegistrations() {
  const registrations = await this.prisma.sessionRegistration.findMany({
    include: {
      user: true,
      session: { include: { event: true } },
    },
  })

  const eventsMap = new Map<number, any>()

  for (const reg of registrations) {
    if (!reg.eventId || !reg.session?.event) continue

    const eventId = reg.eventId

    if (!eventsMap.has(eventId)) {
      eventsMap.set(eventId, {
        eventId: reg.session.event.id,
        eventTitle: reg.session.event.title,
        eventDescription: reg.session.event.description, // added description
        sessions: {},
        totalRegistrations: 0,
      })
    }

    const event = eventsMap.get(eventId)

    if (!event.sessions[reg.sessionId]) {
      event.sessions[reg.sessionId] = {
        sessionId: reg.session.id,
        title: reg.session.title,
        description: reg.session.description,
        startTime: reg.session.startTime,
        endTime: reg.session.endTime,
        location: reg.session.location,
        category: reg.session.category,
        capacity: reg.session.capacity,
        registrationRequired: reg.session.registrationRequired,
        isActive: reg.session.isActive,
        createdAt: reg.session.createdAt,
        updatedAt: reg.session.updatedAt,
        registrations: [],
        totalRegistrations: 0,
      }
    }

    event.sessions[reg.sessionId].registrations.push({
      id: reg.id,
      userId: reg.userId,
      name: reg.name,
      organization: reg.organization,
      email: reg.email,
      whyWantToJoin: reg.whyWantToJoin,
      relevantExperience: reg.relevantExperience,
      joinCode: reg.joinCode,
      createdAt: reg.createdAt,
      user: reg.user,
    })

    event.sessions[reg.sessionId].totalRegistrations++
    event.totalRegistrations++
  }

  const events = Array.from(eventsMap.values()).map(event => ({
    ...event,
    sessions: Object.values(event.sessions),
  }))

  return { count: registrations.length, events }
}




  async getBySession(sessionId: number) {
    const registrations = await this.prisma.sessionRegistration.findMany({
      where: { sessionId },
      include: { session: true },
    })
    const count = await this.prisma.sessionRegistration.count({ where: { sessionId } })
    return { count, registrations }
  }

  async getAllJoinedParticipants() {
    const participants = await this.prisma.sessionJoin.findMany({ include: { user: true, session: true } })
    const count = await this.prisma.sessionJoin.count()
    return { count, participants }
  }

  async getJoinedParticipantsBySession(sessionId: number) {
    const participants = await this.prisma.sessionJoin.findMany({
      where: { sessionId },
      include: { user: true, session: true },
    })
    const count = await this.prisma.sessionJoin.count({ where: { sessionId } })
    return { count, participants }
  }

  private decodeToken(token: string) {
    const payload = token.split('.')[1]
    const json = Buffer.from(payload, 'base64').toString('utf8')
    return JSON.parse(json)
  }

async getSessionsByUser(userId: number, eventId?: number) {
  const registrations = await this.prisma.sessionRegistration.findMany({
    where: {
      userId,
      ...(eventId && { session: { eventId } }),
    },
    include: {
      session: {
        include: {
          event: true,
          speakers: {
            include: {
              user: true, // include user details for each speaker
            },
          },
        },
      },
    },
  })

  return registrations.map(reg => ({
    sessionId: reg.session.id,
    title: reg.session.title,
    description: reg.session.description,
    startTime: reg.session.startTime,
    endTime: reg.session.endTime,
    location: reg.session.location,
    category: reg.session.category,
    isActive: reg.session.isActive,
    joinCode: reg.joinCode,
    event: reg.session.event
      ? {
          eventId: reg.session.event.id,
          title: reg.session.event.title,
          description: reg.session.event.description,
        }
      : null,
    speakers: reg.session.speakers.map(sp => ({
      speakerId: sp.id,
      bio: sp.bio,
      expertise: sp.expertise,
      designations: sp.designations,
      user: sp.user
        ? {
            userId: sp.user.id,
            name: sp.user.name,
            file: sp.user.file,
            email: sp.user.email,
          }
        : null,
    })),
  }))
}

async joinSession(userId: number, sessionId: number) {
  const session = await this.prisma.session.findUnique({
    where: { id: sessionId },
  })
  if (!session) throw new NotFoundException('Session not found')

  const registrationRequired = session.registrationRequired

  if (registrationRequired) {
    const registration = await this.prisma.sessionRegistration.findFirst({
      where: { userId, sessionId },
    })
    if (!registration) {
      throw new BadRequestException('User not registered for this session')
    }
  } else {
    const existingRegistration = await this.prisma.sessionRegistration.findFirst({
      where: { sessionId, userId },
    })
    if (existingRegistration) {
      throw new BadRequestException('User cannot join directly, registration exists')
    }
  }

  const existingJoin = await this.prisma.sessionJoin.findUnique({
    where: { sessionId_userId: { sessionId, userId } },
  })
  if (existingJoin) {
    return { message: 'User already joined this session' }
  }

  await this.prisma.sessionJoin.create({
    data: { sessionId, userId },
  })

  return { message: 'User successfully joined the session' }
}



}
