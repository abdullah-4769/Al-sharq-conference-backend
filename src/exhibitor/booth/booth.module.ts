import { Module } from '@nestjs/common';
import { PrismaService } from '../../lib/prisma/prisma.service';
import { BoothService } from './booth.service';
import { BoothController } from './booth.controller';

@Module({
  controllers: [BoothController],
  providers: [BoothService, PrismaService],
})
export class BoothModule {}
