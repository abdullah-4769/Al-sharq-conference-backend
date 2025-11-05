import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../lib/prisma/prisma.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { JwtService } from '../../lib/jwt/jwt.service';

@Injectable()
export class EventService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

async create(createEventDto: CreateEventDto) {
 
  await this.prisma.sessionRegistration.deleteMany({})
  await this.prisma.sessionJoin.deleteMany({})
  await this.prisma.participantDirectory.deleteMany({})
  await this.prisma.participant.deleteMany({}) // Add this
  await this.prisma.eventRegistration.deleteMany({}) // Add this
  await this.prisma.eventJoin.deleteMany({}) // Add this
  await this.prisma.session.deleteMany({})
  await this.prisma.event.deleteMany({})
  
  const sponsorConnect = createEventDto.sponsors?.map(s => ({ id: s.id })) || []
  const exhibitorConnect = createEventDto.exhibitors?.map(e => ({ id: e.id })) || []

  // Create event
  const event = await this.prisma.event.create({
    data: {
      title: createEventDto.title,
      description: createEventDto.description,
      location: createEventDto.location,
      googleMapLink: createEventDto.googleMapLink,
      mapstatus: createEventDto.mapstatus ?? false,
      sponsors: { connect: sponsorConnect },
      exhibitors: { connect: exhibitorConnect },
    },
    include: { sponsors: true, exhibitors: true },
  })

  // Generate token (without time-based expiration)
  const token = this.jwtService.sign({ eventId: event.id })

  // Save token
  const updatedEvent = await this.prisma.event.update({
    where: { id: event.id },
    data: { joinToken: token },
    include: { sponsors: true, exhibitors: true },
  })

  return updatedEvent
}




  async findAll() {
    return this.prisma.event.findMany({
      include: { sponsors: true, exhibitors: true },
    });
  }

  async findOne(id: number) {
    const event = await this.prisma.event.findUnique({
      where: { id },
      include: { sponsors: true, exhibitors: true },
    });
    if (!event) throw new NotFoundException('Event not found');
    return event;
  }

async update(id: number, updateEventDto: UpdateEventDto) {
  await this.findOne(id)

  const sponsorConnect =
    updateEventDto.sponsors?.map((s) =>
      typeof s === 'object' ? { id: s.id } : { id: s }
    ) || []

  const exhibitorConnect =
    updateEventDto.exhibitors?.map((e) =>
      typeof e === 'object' ? { id: e.id } : { id: e }
    ) || []

  const data: any = {
    title: updateEventDto.title,
    description: updateEventDto.description,
    location: updateEventDto.location,
    googleMapLink: updateEventDto.googleMapLink,
    startTime: updateEventDto.startTime,
    endTime: updateEventDto.endTime,
    mapstatus:
      typeof updateEventDto.mapstatus === 'boolean'
        ? updateEventDto.mapstatus
        : undefined,
    sponsors: sponsorConnect.length ? { set: sponsorConnect } : undefined,
    exhibitors: exhibitorConnect.length ? { set: exhibitorConnect } : undefined,
  }

  return this.prisma.event.update({
    where: { id },
    data,
    include: {
      sponsors: true,
      exhibitors: true,
    },
  })
}


async remove(id: number) {
  await this.findOne(id) 


  await this.prisma.session.deleteMany({
    where: { eventId: id },
  })


  return this.prisma.event.delete({
    where: { id },
  })
}




    async findAllWithDetails() {
    const events = await this.prisma.event.findMany({
      include: {
        sponsors: true,
        exhibitors: true,
        sessions: true, 
      },
    });

    return events.map(event => {
      

      return { ...event,  };
    });
  }

 async findAllShortInfo() {
    const events = await this.prisma.event.findMany();

    return events.map(event => {

     

      return {
        eventId: event.id,
        title: event.title,
        description: event.description,
        startTime: event.startTime,
        endTime: event.endTime,
        location: event.location,

        createdAt: event.createdAt,
        updatedAt: event.updatedAt,
 
      };
    });
  }

// service
async getAllEventSessions(eventId: number) {
  const nowMs = Date.now()

  const allSessions = await this.prisma.session.findMany({
    where: { eventId, isActive: true },
    include: { event: true, speakers: { include: { user: true } } },
    orderBy: { startTime: 'asc' },
  })

  const sessions = allSessions.map((s) => {
    const startMs = s.startTime.getTime()
    const endMs = s.endTime.getTime()
    const isLive = startMs <= nowMs && endMs >= nowMs

    let timeToStart: number | null = null
    if (startMs > nowMs) {
      timeToStart = Math.ceil((startMs - nowMs) / (1000 * 60))
    }

    return {
      sessionId: s.id,
      sessionTitle: s.title,
      sessionDescription: s.description || null,
      category: s.category || null,
      duration: `${s.startTime.toISOString()} - ${s.endTime.toISOString()}`,
      location: s.location || null,
      registrationRequired: s.registrationRequired ?? false,
      isLive,
      timeToStart,
      speakers: s.speakers.map((sp) => ({
        speakerId: sp.id,
        fullName: sp.user?.name || null,
        bio: sp.bio || null,
        pic: sp.user?.file || null,
      })),
      event: s.event
        ? {
            eventId: s.event.id,
            eventTitle: s.event.title,
            eventDescription: s.event.description,
          }
        : null,
    }
  })

  return {
    liveSessions: sessions.filter((s) => s.isLive),
    allSessions: sessions,
  }
}

 async getSponsorsAndExhibitorsByEvent(eventId: number) {
    // Sponsors related to this event
    const sponsors = await this.prisma.sponsor.findMany({
      where: {
        events: {
          some: {
            id: eventId
          }
        }
      },
      select: {
        id: true,
        name: true,
        description: true,
        category: true
      }
    });

    // Exhibitors related to this event
    const exhibitors = await this.prisma.exhibitor.findMany({
      where: {
        events: {
          some: {
            id: eventId
          }
        }
      },
      select: {
        id: true,
        name: true,
        description: true,
        location: true
      }
    });

    return {
      sponsors,
      exhibitors
    };
  }


async getAllSponsorsAndExhibitors() {

  const sponsors = await this.prisma.sponsor.findMany({
    select: {
      id: true,
      name: true,
      description: true,
      category: true
    }
  })


  const exhibitors = await this.prisma.exhibitor.findMany({
    select: {
      id: true,
      name: true,
      description: true,
      location: true
    }
  })

  return {
    sponsors,
    exhibitors
  }
}

// EventService.ts
async getEventSummary() {
  const nowMs = Date.now()
  const events = await this.prisma.event.findMany({ include: { sessions: true } })

  let totalSessions = 0
  let liveSessions = 0
  let scheduledSessions = 0

  const eventDetails = events.map(event => {
    const eventSessionCount = event.sessions.length
    totalSessions += eventSessionCount

    let liveCount = 0
    let scheduledCount = 0

    event.sessions.forEach(session => {
      const startMs = session.startTime.getTime()
      const endMs = session.endTime.getTime()
      if (startMs <= nowMs && endMs >= nowMs) liveCount++
      if (startMs > nowMs) scheduledCount++
    })

    liveSessions += liveCount
    scheduledSessions += scheduledCount

    return {
      id: event.id,
      name: event.title,
      description: event.description,
      googleMapLink: event.googleMapLink || null,
      totalSessions: eventSessionCount,
    }
  })

  return {
    totalSessions,
    liveSessions,
    scheduledSessions,
    events: eventDetails,
  }
}





}
