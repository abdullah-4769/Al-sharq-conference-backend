import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'src/lib/prisma/prisma.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { IProfileService } from './interfaces/profile-service.interface';

@Injectable()
export class ProfileService implements IProfileService {
  constructor(private readonly prisma: PrismaService) {}

  // Get a profile by ID
  async getProfile(userId: number) {
    if (!userId) throw new BadRequestException('User ID is required');

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    return user;
  }


  async updateProfile(userId: number, data: UpdateProfileDto) {
    if (!userId) throw new BadRequestException('User ID is required');

    const user = await this.prisma.user.update({
      where: { id: userId },
      data,
    });

    return user;
  }

  // Admin only: get all users
  async getAllProfiles(requesterRole: string) {
    if (requesterRole !== 'admin') throw new ForbiddenException('Access denied');
    return this.prisma.user.findMany();
  }


  async updateAnyProfile(userId: number, data: UpdateProfileDto, requesterRole: string) {
    if (requesterRole !== 'admin') throw new ForbiddenException('Access denied');

    const user = await this.prisma.user.update({
      where: { id: userId },
      data,
    });

    return user;
  }

async getProfilebyuserid(userId: number) {
  const user = await this.prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new NotFoundException('User not found');
  return user;
}


}
