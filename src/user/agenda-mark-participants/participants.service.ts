import { Injectable, BadRequestException ,NotFoundException} from '@nestjs/common';
import { PrismaService } from '../../lib/prisma/prisma.service';

@Injectable()
export class ParticipantsService {
  constructor(private prisma: PrismaService) {}


async addToAgenda(userId: number, sessionId: number, eventId: number) {

  const session = await this.prisma.session.findUnique({
    where: { id: sessionId },
    include: { participants: true },
  });

  if (!session) throw new BadRequestException('Session not found');
  if (session.eventId !== eventId) throw new BadRequestException('Session does not belong to this event');
  if (session.capacity && session.participants.length >= session.capacity) throw new BadRequestException('Session is full');


  let participant = await this.prisma.participant.findFirst({
    where: { userId, eventId },
  });


  if (!participant) {
    participant = await this.prisma.participant.create({
      data: { userId, eventId },
    });
  }


  const alreadyAdded = session.participants.some((p) => p.id === participant.id);
  if (alreadyAdded) throw new BadRequestException('Already added to agenda');


  await this.prisma.session.update({
    where: { id: sessionId },
    data: {
      participants: {
        connect: { id: participant.id },
      },
    },
  });

  return { message: 'Added to agenda successfully' };
}

  async getByUserId(userId: number) {
    const participants = await this.prisma.participant.findMany({
      where: { userId },
      include: {
        event: {
          include: { sessions: true }, // include all sessions for the event
        },
        sessions: true, // participant's sessions
      },
    });

    if (!participants.length) {
      throw new NotFoundException('No participant found for this user');
    }

    // Group sessions under each event
    const result = participants.map((p) => ({
      eventId: p.eventId,
      eventTitle: p.event.title, // use title instead of name
      sessions: p.event.sessions.map((s) => ({
        sessionId: s.id,
        sessionTitle: s.title, // use title instead of name
      })),
    }));

    return result;
  }

  // 2. Get all participants by eventId
async getByEventId(eventId: number) {
  const participants = await this.prisma.participant.findMany({
    where: { eventId },
    include: {
      user: true,
      sessions: true,
    },
  });

  if (!participants.length) {
    throw new NotFoundException('No participants found for this event');
  }

  const totalSessions = new Set<number>();
  const sessionCounts: Record<number, number> = {};

  const formattedParticipants = participants.map((p) => {
    p.sessions.forEach((s) => {
      totalSessions.add(s.id);
      sessionCounts[s.id] = (sessionCounts[s.id] || 0) + 1;
    });

    return {
      userId: p.userId,
      userName: p.user.name,
      sessions: p.sessions.map((s) => ({
        sessionId: s.id,
        sessionTitle: s.title,
        totalParticipantsPerSession: sessionCounts[s.id],
      })),
    };
  });

  return {
    totalSessions: totalSessions.size,
    totalParticipants: participants.length,
    participants: formattedParticipants,
  };
}

 
async getBySessionId(sessionId: number) {
  const session = await this.prisma.session.findUnique({
    where: { id: sessionId },
    include: {
      participants: { include: { user: true } },
      event: true,
    },
  });

  if (!session) throw new NotFoundException('Session not found');

  return {
    session: {
      id: session.id,
      title: session.title,
      startTime: session.startTime,
      endTime: session.endTime,
      location: session.location,
    },
    event: session.event
      ? {
          id: session.event.id,
          title: session.event.title,
          description: session.event.description,
          startTime: session.event.startTime,
          endTime: session.event.endTime,
        }
      : null,
    participants: session.participants.map((p) => ({
      userId: p.userId,
      userName: p.user.name,
    })),
  };
}


}
