import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../lib/prisma/prisma.service';
import { CreateBoothDto } from './dto/create-booth.dto';
import { UpdateBoothDto } from './dto/update-booth.dto';

@Injectable()
export class BoothService {
  constructor(private prisma: PrismaService) {}

 async create(dto: CreateBoothDto) {
    const existingBooth = await this.prisma.booth.findFirst({
      where: { exhibitorId: dto.exhibitorId },
    })

    if (existingBooth) {
      await this.prisma.booth.delete({
        where: { id: existingBooth.id },
      })
    }

    return this.prisma.booth.create({
      data: dto,
      include: { exhibitor: true },
    })
  }

  async findAll() {
    return this.prisma.booth.findMany({
      include: { exhibitor: true },
    });
  }

  async findOne(id: number) {
    const booth = await this.prisma.booth.findUnique({
      where: { id },
      include: { exhibitor: true },
    });
    if (!booth) throw new NotFoundException('Booth not found');
    return booth;
  }

  async update(id: number, dto: UpdateBoothDto) {
    await this.findOne(id); // check if exists
    return this.prisma.booth.update({
      where: { id },
      data: dto,
      include: { exhibitor: true },
    });
  }

  async remove(id: number) {
    await this.findOne(id); // check if exists
    return this.prisma.booth.delete({
      where: { id },
      include: { exhibitor: true },
    });
  }
  async findByExhibitor(exhibitorId: number) {
    const booth = await this.prisma.booth.findFirst({
      where: { exhibitorId },
      include: { exhibitor: false },
    })
    if (!booth) throw new NotFoundException('Booth not found for this exhibitor')
    return booth
  }



}
