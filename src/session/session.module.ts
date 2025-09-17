import { Module } from '@nestjs/common';
import { SessionService } from './session.service';
import { SessionController } from './session.controller';
import { PrismaService } from '../lib/prisma/prisma.service';
import { JwtModule } from '../lib/jwt/jwt.module'

@Module({
    imports: [JwtModule],
  controllers: [SessionController],
  providers: [SessionService, PrismaService],
})
export class SessionModule {}
