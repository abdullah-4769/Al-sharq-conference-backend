import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../lib/prisma/prisma.service';
import { CreateEventRegistrationDto } from './dto/create-event-registration.dto';
import { VerifyJoinCodeDto } from './dto/verify-join-code.dto';

@Injectable()
export class EventRegistrationService {
  constructor(private prisma: PrismaService) {}

  private async generateCode() {
    const { nanoid } = await import('nanoid'); // dynamic import inside function
    return nanoid(6).toUpperCase();
  }

  async register(dto: CreateEventRegistrationDto) {
    const event = await this.prisma.event.findUnique({
      where: { id: dto.eventId },
    });

    if (!event) throw new NotFoundException('Event not found');
    if (!event.joinToken) throw new BadRequestException('Event join token not available');

    // Check if token expired
    const now = Date.now();
    const tokenPayload = this.decodeToken(event.joinToken);
    if (tokenPayload.exp * 1000 < now) {
      throw new BadRequestException('Event join token has expired');
    }

    // generate 6-character join code
    const joinCode = await this.generateCode();

    const registration = await this.prisma.eventRegistration.create({
      data: {
        userId: dto.userId,
        name: dto.name,
        email: dto.email,
        eventId: dto.eventId,
        joinCode,
        token: event.joinToken,
      },
    });

    return { joinCode, token: event.joinToken };
  }

// service
async verifyCode(dto: VerifyJoinCodeDto) {
  const registration = await this.prisma.eventRegistration.findUnique({
    where: { joinCode: dto.joinCode },
    include: { event: true },
  });

  if (!registration) {
    throw new NotFoundException('Invalid join code');
  }

  const { userId, eventId } = registration;

  if (!userId) {
    throw new BadRequestException('Registration missing user reference');
  }

  const existingJoin = await this.prisma.eventJoin.findUnique({
    where: { eventId_userId: { eventId, userId } },
  });

  if (existingJoin) {
    return {
      message: 'User already joined this event',

    };
  }

  await this.prisma.eventJoin.create({
    data: { eventId, userId },
  });

  return {
    message: 'Join verified',
    event: registration.event,
    token: registration.token,
  };
}



// event-registration.service.ts
async getAllRegistrations() {
  const registrations = await this.prisma.eventRegistration.findMany({
    include: { event: true },
  });

  const count = await this.prisma.eventRegistration.count();

  return { count, registrations };
}

async getByEvent(eventId: number) {
  const registrations = await this.prisma.eventRegistration.findMany({
    where: { eventId },
    include: { event: true },
  });

  const count = await this.prisma.eventRegistration.count({ where: { eventId } });

  return { count, registrations };
}



// Get all participants who joined any event
async getAllJoinedParticipants() {
  const participants = await this.prisma.eventJoin.findMany({
    include: {
      user: true,
      event: true,
    },
  });

  const count = await this.prisma.eventJoin.count();

  return { count, participants };
}

// Get participants who joined by eventId
async getJoinedParticipantsByEvent(eventId: number) {
  const participants = await this.prisma.eventJoin.findMany({
    where: { eventId },
    include: {
      user: true,
      event: true,
    },
  });

  const count = await this.prisma.eventJoin.count({
    where: { eventId },
  });

  return { count, participants };
}



  private decodeToken(token: string) {
    const payload = token.split('.')[1];
    const json = Buffer.from(payload, 'base64').toString('utf8');
    return JSON.parse(json);
  }
}
