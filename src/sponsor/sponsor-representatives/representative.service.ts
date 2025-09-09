import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../lib/prisma/prisma.service';
import { CreateRepresentativeDto } from './dto/create-representative.dto';
import { UpdateRepresentativeDto } from './dto/update-representative.dto';

@Injectable()
export class RepresentativeService {
  constructor(private readonly prisma: PrismaService) {}

  async createRepresentative(data: CreateRepresentativeDto) {
    return this.prisma.representative.create({ data });
  }

  async getAllRepresentatives() {
    return this.prisma.representative.findMany({
      include: { sponsor: true, user: true },
    });
  }

  async getRepresentativeById(id: number) {
    const rep = await this.prisma.representative.findUnique({
      where: { id },
      include: { sponsor: true, user: true },
    });
    if (!rep) throw new NotFoundException('Representative not found');
    return rep;
  }

  async updateRepresentative(id: number, data: UpdateRepresentativeDto) {
    await this.getRepresentativeById(id);
    return this.prisma.representative.update({ where: { id }, data });
  }

  async deleteRepresentative(id: number) {
    await this.getRepresentativeById(id);
    return this.prisma.representative.delete({ where: { id } });
  }

  async getRepresentativesBySponsor(sponsorId: number) {
    return this.prisma.representative.findMany({
      where: { sponsorId },
      include: { user: true },
    });
  }
}
