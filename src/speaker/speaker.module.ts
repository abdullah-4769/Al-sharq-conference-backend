import { Module } from '@nestjs/common';
import { SpeakerService } from './speaker.service';
import { SpeakerController } from './speaker.controller';
import { PrismaService } from '../lib/prisma/prisma.service';

@Module({
  controllers: [SpeakerController],
  providers: [SpeakerService, PrismaService],
})
export class SpeakerModule {}
