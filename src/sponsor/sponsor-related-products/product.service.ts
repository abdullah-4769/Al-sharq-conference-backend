import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../lib/prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductService {
  constructor(private readonly prisma: PrismaService) {}

  async createProduct(data: CreateProductDto) {
    return this.prisma.product.create({ data });
  }

  async getAllProducts() {
    return this.prisma.product.findMany({
      include: { sponsor: true },
    });
  }

  async getProductById(id: number) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: { sponsor: true },
    });
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  async updateProduct(id: number, data: UpdateProductDto) {
    await this.getProductById(id);
    return this.prisma.product.update({ where: { id }, data });
  }

  async deleteProduct(id: number) {
    await this.getProductById(id);
    return this.prisma.product.delete({ where: { id } });
  }

  async getProductsBySponsor(sponsorId: number) {
    return this.prisma.product.findMany({
      where: { sponsorId },
    });
  }
}
