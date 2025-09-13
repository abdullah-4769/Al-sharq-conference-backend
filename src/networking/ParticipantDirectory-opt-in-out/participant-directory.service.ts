import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../lib/prisma/prisma.service';
import { CreateParticipantDirectoryDto } from './dto/create-participant-directory.dto';
import { UpdateParticipantDirectoryDto } from './dto/update-participant-directory.dto';

@Injectable()
export class ParticipantDirectoryService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateParticipantDirectoryDto) {
    const user = await this.prisma.user.findUnique({ where: { id: dto.userId } });
    if (!user) throw new NotFoundException(`User with id ${dto.userId} not found`);

    const event = await this.prisma.event.findUnique({ where: { id: dto.eventId } });
    if (!event) throw new NotFoundException(`Event with id ${dto.eventId} not found`);

    return this.prisma.participantDirectory.create({
      data: {
        userId: dto.userId,
        eventId: dto.eventId,
        optedIn: dto.optedIn ?? false,
      },
    });
  }

  async getStatus(eventId: number, userId: number) {
    const record = await this.prisma.participantDirectory.findUnique({
      where: { userId_eventId: { userId, eventId } },
    });
    if (!record) throw new NotFoundException(`Participant record not found`);
    return record;
  }

  async updateStatus(eventId: number, userId: number, dto: UpdateParticipantDirectoryDto) {
    const record = await this.prisma.participantDirectory.findUnique({
      where: { userId_eventId: { userId, eventId } },
    });
    if (!record) throw new NotFoundException(`Participant record not found`);

    return this.prisma.participantDirectory.update({
      where: { userId_eventId: { userId, eventId } },
      data: { optedIn: dto.optedIn },
    });
  }


async getOptedInParticipants(eventId: number) {
  return this.prisma.participantDirectory.findMany({
    where: {
      eventId,
      optedIn: true,
    },
    select: {
      participant: {
        select: {
          id: true,
          name: true,
          role: true,
          file: true, 
        },
      },
    },
  });
}



}
