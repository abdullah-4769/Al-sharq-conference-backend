import { Module } from '@nestjs/common';
import { EventService } from './event.service';
import { EventController } from './event.controller';
import { PrismaService } from '../../lib/prisma/prisma.service';
import { JwtModule } from '../../lib/jwt/jwt.module';
@Module({
  imports: [JwtModule],
  controllers: [EventController],
  providers: [EventService, PrismaService],
})
export class EventModule {}
