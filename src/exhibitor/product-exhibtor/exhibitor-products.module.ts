import { Module } from '@nestjs/common';
import { ExhibitorProductsService } from './exhibitor-products.service';
import { ExhibitorProductsController } from './exhibitor-products.controller';
import { PrismaService } from '../../lib/prisma/prisma.service';

@Module({
  controllers: [ExhibitorProductsController],
  providers: [ExhibitorProductsService, PrismaService],
})
export class ExhibitorProductsModule {}
