import { Module } from '@nestjs/common';
import { PrismaService } from '../../lib/prisma/prisma.service';
import { ExhibitorRepresentativeService } from './exhibitor-representative.service';
import { ExhibitorRepresentativeController } from './exhibitor-representative.controller';

@Module({
  controllers: [ExhibitorRepresentativeController],
  providers: [ExhibitorRepresentativeService, PrismaService],
})
export class ExhibitorRepresentativeModule {}
