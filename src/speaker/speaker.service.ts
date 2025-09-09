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
}
