import { Module } from '@nestjs/common'
import { BrevoService } from './brevo.service'
import { BrevoController } from './brevo.controller'
import { PrismaService } from '../lib/prisma/prisma.service'

@Module({
  controllers: [BrevoController],
  providers: [BrevoService, PrismaService],
  exports: [BrevoService],
})
export class BrevoModule {}
