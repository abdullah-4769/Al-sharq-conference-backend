import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../lib/prisma/prisma.service';
import { CreateSessionDto } from './dto/create-session.dto';
import { UpdateSessionDto } from './dto/update-session.dto';

@Injectable()
export class SessionService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateSessionDto) {
    // check if event exists
    const event = await this.prisma.event.findUnique({
      where: { id: data.eventId },
    });
    if (!event) {
      throw new NotFoundException(`Event with id ${data.eventId} not found`);
    }

    // check speakers
    if (data.speakerIds && data.speakerIds.length > 0) {
      const speakers = await this.prisma.speaker.findMany({
        where: { id: { in: data.speakerIds } },
        select: { id: true },
      });

      const foundIds = speakers.map((s) => s.id);
      const missing = data.speakerIds.filter((id) => !foundIds.includes(id));

      if (missing.length > 0) {
        throw new NotFoundException(
          `Speakers not found: ${missing.join(', ')}`,
        );
      }
    }

    return this.prisma.session.create({
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
        speakers: data.speakerIds
          ? { connect: data.speakerIds.map((id) => ({ id })) }
          : undefined,
      },
      include: {
        speakers: { include: { user: true } },
        event: true,
      },
    });
  }

  async findAll() {
    return this.prisma.session.findMany({
      include: {
        speakers: { include: { user: true } },
        event: true,
        participants: { include: { user: true } },
      },
    });
  }

  async findOne(id: number) {
    const session = await this.prisma.session.findUnique({
      where: { id },
      include: {
        speakers: { include: { user: true } },
        event: true,
        participants: { include: { user: true } },
      },
    });

    if (!session) {
      throw new NotFoundException(`Session with id ${id} not found`);
    }

    return session;
  }

  async update(id: number, data: UpdateSessionDto) {
    const session = await this.prisma.session.findUnique({ where: { id } });
    if (!session) {
      throw new NotFoundException(`Session with id ${id} not found`);
    }

    // validate speakers if provided
    if (data.speakerIds && data.speakerIds.length > 0) {
      const speakers = await this.prisma.speaker.findMany({
        where: { id: { in: data.speakerIds } },
        select: { id: true },
      });
      const foundIds = speakers.map((s) => s.id);
      const missing = data.speakerIds.filter((id) => !foundIds.includes(id));
      if (missing.length > 0) {
        throw new NotFoundException(
          `Speakers not found: ${missing.join(', ')}`,
        );
      }
    }

    return this.prisma.session.update({
      where: { id },
      data: {
        ...data,
        startTime: data.startTime ? new Date(data.startTime) : undefined,
        endTime: data.endTime ? new Date(data.endTime) : undefined,
        speakers: data.speakerIds
          ? {
              set: data.speakerIds.map((id) => ({ id })), // replace old with new
            }
          : undefined,
      },
      include: {
        speakers: { include: { user: true } },
        event: true,
        participants: { include: { user: true } },
      },
    });
  }

  async remove(id: number) {
    const session = await this.prisma.session.findUnique({ where: { id } });
    if (!session) {
      throw new NotFoundException(`Session with id ${id} not found`);
    }

    await this.prisma.session.delete({ where: { id } });
    return { message: 'Session deleted successfully' };
  }
}
