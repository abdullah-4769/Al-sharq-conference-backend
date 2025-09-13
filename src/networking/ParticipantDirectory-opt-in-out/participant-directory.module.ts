import { Module } from '@nestjs/common';
import { ParticipantDirectoryService } from './participant-directory.service';
import { ParticipantDirectoryController } from './participant-directory.controller';
import { PrismaService } from '../../lib/prisma/prisma.service';

@Module({
  controllers: [ParticipantDirectoryController],
  providers: [ParticipantDirectoryService, PrismaService],
})
export class ParticipantDirectoryModule {}
