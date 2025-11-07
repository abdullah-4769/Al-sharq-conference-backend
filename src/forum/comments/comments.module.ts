import { Module } from '@nestjs/common'
import { CommentsService } from './comments.service'
import { CommentsController } from './comments.controller'
import { CommentsRepository } from './comments.repository'
import { PrismaService } from '../../lib/prisma/prisma.service'

@Module({
  imports: [],
  controllers: [CommentsController],
  providers: [CommentsService, CommentsRepository, PrismaService],
})
export class CommentsModule {}
