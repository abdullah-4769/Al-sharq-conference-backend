import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../lib/prisma/prisma.service';
import { Speaker } from '@prisma/client';

@Injectable()
export class SpeakerService {
  constructor(private prisma: PrismaService) {}


  async create(data: Omit<Speaker, 'id' | 'createdAt' | 'updatedAt'>) {
    return this.prisma.speaker.create({ data });
  }


  async findAll() {
    return this.prisma.speaker.findMany({
      include: {
        user: {
          select: {
            name: true,
            email: true,
            phone: true,
            file: true,
          },
        },
      },
    });
  }


  async findOne(id: number) {
    const speaker = await this.prisma.speaker.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            phone: true,
            file: true,
          },
        },
      },
    });

    if (!speaker) {
      throw new NotFoundException(`Speaker with id ${id} not found`);
    }

    return speaker;
  }


  async update(id: number, data: Partial<Speaker>) {
    return this.prisma.speaker.update({
      where: { id },
      data,
    });
  }

 
  async remove(id: number) {
    const speaker = await this.prisma.speaker.findUnique({ where: { id } });
    if (!speaker) {
      throw new NotFoundException(`Speaker with id ${id} not found`);
    }

    await this.prisma.speaker.delete({ where: { id } });
    return { message: 'Speaker deleted successfully' };
  }

async findSpeakersByEvent(eventId: number) {
    const speakers = await this.prisma.speaker.findMany({
      where: {
        sessions: {
          some: { eventId },
        },
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            file: true,
          },
        },
        sessions: {
          where: { eventId },
          select: { id: true, title: true },
        },
      },
    });

    return speakers.map((speaker) => ({
      id: speaker.id,
      bio: speaker.bio,
      designations: speaker.designations,
      expertise: speaker.expertise,
      tags: speaker.tags,
      sessionCount: speaker.sessions.length,
      sessions: speaker.sessions.map((s) => ({ id: s.id, title: s.title })),
      user: speaker.user ? speaker.user : null, // show user only if exists
    }));
  }



}
