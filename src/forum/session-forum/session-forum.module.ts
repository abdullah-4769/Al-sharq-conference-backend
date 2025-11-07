import { Module } from '@nestjs/common';
import { SessionForumService } from './session-forum.service';
import { SessionForumController } from './session-forum.controller';
import { PrismaService } from '../../lib/prisma/prisma.service';

@Module({
  controllers: [SessionForumController],
  providers: [SessionForumService, PrismaService],
})
export class SessionForumModule {}
