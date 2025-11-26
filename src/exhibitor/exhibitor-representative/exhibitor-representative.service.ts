import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../lib/prisma/prisma.service';
import { CreateExhibitorRepresentativeDto } from './dto/create-exhibitor-representative.dto';
import { UpdateExhibitorRepresentativeDto } from './dto/update-exhibitor-representative.dto';

@Injectable()
export class ExhibitorRepresentativeService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateExhibitorRepresentativeDto) {
    return this.prisma.exhibitorRepresentative.create({
      data: dto,
      include: {
        exhibitor: true,
        user: true,
      },
    });
  }

  async findAll() {
    return this.prisma.exhibitorRepresentative.findMany({
      include: {
        exhibitor: true,
        user: true,
      },
    });
  }

  async findOne(id: number) {
    const representative = await this.prisma.exhibitorRepresentative.findUnique({
      where: { id },
      include: {
        exhibitor: true,
        user: true,
      },
    });
    if (!representative) throw new NotFoundException('Representative not found');
    return representative;
  }

  async update(id: number, dto: UpdateExhibitorRepresentativeDto) {
    await this.findOne(id); // ensure exists
    return this.prisma.exhibitorRepresentative.update({
      where: { id },
      data: dto,
      include: {
        exhibitor: true,
        user: true,
      },
    });
  }

  async remove(id: number) {
    await this.findOne(id); // ensure exists
    return this.prisma.exhibitorRepresentative.delete({
      where: { id },
      include: {
        exhibitor: true,
        user: true,
      },
    });
  }

async findByExhibitor(exhibitorId: number) {
  return this.prisma.exhibitorRepresentative.findMany({
    where: { exhibitorId },
    include: {
      exhibitor: false,
      user: true,
    },
  });
}


}
