import { Module } from '@nestjs/common';
import { ExhibiterosService } from './exhibiteros.service';
import { ExhibiterosController } from './exhibiteros.controller';
import { PrismaService } from '../../lib/prisma/prisma.service';

@Module({
  controllers: [ExhibiterosController],
  providers: [ExhibiterosService, PrismaService],
})
export class ExhibiterosModule {}
