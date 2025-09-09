import { Module } from '@nestjs/common';
import { RepresentativeService } from './representative.service';
import { RepresentativeController } from './representative.controller';
import { PrismaService } from '../../lib/prisma/prisma.service';

@Module({
  controllers: [RepresentativeController],
  providers: [RepresentativeService, PrismaService],
})
export class RepresentativeModule {}
