import { Injectable,NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../lib/prisma/prisma.service';
import { ExhibitorProduct } from '@prisma/client';
import { CreateExhibitorProductDto } from './dto/create-exhibitor-product.dto';

@Injectable()
export class ExhibitorProductsService {
  constructor(private prisma: PrismaService) {}


   async createProduct(dto: CreateExhibitorProductDto): Promise<ExhibitorProduct> {

    const exhibitor = await this.prisma.exhibitor.findUnique({
      where: { id: dto.exhibitorId },
    });

    if (!exhibitor) {
      throw new NotFoundException(`Exhibitor with id ${dto.exhibitorId} does not exist`);
    }

    return this.prisma.exhibitorProduct.create({
      data: {
        title: dto.title,
        description: dto.description,
        exhibitor: { connect: { id: dto.exhibitorId } },
      },
    });
  }


  async getAllProducts(): Promise<ExhibitorProduct[]> {
    return this.prisma.exhibitorProduct.findMany({
      include: { exhibitor: true },
    });
  }


  async getProductById(id: number): Promise<ExhibitorProduct | null> {
    return this.prisma.exhibitorProduct.findUnique({
      where: { id },
      include: { exhibitor: true },
    });
  }


  async updateProduct(id: number, dto: CreateExhibitorProductDto): Promise<ExhibitorProduct> {
    return this.prisma.exhibitorProduct.update({
      where: { id },
      data: {
        title: dto.title,
        description: dto.description,
        exhibitor: { connect: { id: dto.exhibitorId } },
      },
    });
  }

  async deleteProduct(id: number): Promise<ExhibitorProduct> {
    return this.prisma.exhibitorProduct.delete({
      where: { id },
    });
  }

    async getProductsByExhibitorId(exhibitorId: number): Promise<ExhibitorProduct[]> {
    return this.prisma.exhibitorProduct.findMany({
      where: { exhibitorId },
      include: { exhibitor: true },
    })
  }


}
