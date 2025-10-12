import { Module } from '@nestjs/common';
import { SponsorService } from './sponsor.service';
import { SponsorController } from './sponsor.controller';
import { PrismaService } from '../../lib/prisma/prisma.service';
import { SpacesModule } from '../../spaces/spaces.module'
@Module({

  imports: [SpacesModule],

  controllers: [SponsorController],
  providers: [SponsorService, PrismaService],
})
export class SponsorModule {}
