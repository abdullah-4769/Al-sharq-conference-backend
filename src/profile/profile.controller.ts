import { Controller, Get, Patch, Param, Body, UseGuards,Req, ForbiddenException, NotFoundException } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { GetUser } from 'src/common/decorators/get-user.decorator';

@UseGuards(JwtAuthGuard)
@Controller('profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

 
  @Get('me')
  async getMyProfile(@GetUser('id') userId: number) {
    return this.profileService.getProfile(userId);
  }


  @Patch('me')
  async updateMyProfile(
    @GetUser('id') userId: number,
    @Body() data: UpdateProfileDto,
  ) {
    return this.profileService.updateProfile(userId, data);
  }


  @Get('all')
  async getAllProfiles(@GetUser('role') role: string) {
    return this.profileService.getAllProfiles(role);
  }


  @Patch(':id')
  async updateAnyProfile(
    @Param('id') id: string,
    @Body() data: UpdateProfileDto,
    @GetUser('role') role: string,
  ) {
    return this.profileService.updateAnyProfile(Number(id), data, role);
  }

 @UseGuards(JwtAuthGuard)
  @Get('user/:id')
  async getProfilebyuserid(@Req() req: any, @Param('id') id: string) {

    if (req.user.role !== 'admin') {
      throw new ForbiddenException('Access denied');
    }

    const user = await this.profileService.getProfile(Number(id));
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }



}
