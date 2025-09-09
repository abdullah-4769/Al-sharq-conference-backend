// lib/jwt/jwt.module.ts
import { Module } from '@nestjs/common';
import { JwtService } from './jwt.service';
import { JwtModule as NestJwtModule } from '@nestjs/jwt';

@Module({
  imports: [NestJwtModule.register({ secret: process.env.JWT_SECRET })],
  providers: [JwtService],
  exports: [JwtService], // export it so other modules can use it
})
export class JwtModule {}
