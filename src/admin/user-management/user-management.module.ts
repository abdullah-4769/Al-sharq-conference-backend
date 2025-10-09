import { Module } from '@nestjs/common'
import { UserManagementService } from './user-management.service'
import { UserManagementController } from './user-management.controller'
import { PrismaService } from '../../lib/prisma/prisma.service';

@Module({
  providers: [UserManagementService, PrismaService],
  controllers: [UserManagementController],
})
export class UserManagementModule {}
