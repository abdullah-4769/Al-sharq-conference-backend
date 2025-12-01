import {
  Controller,
  Post,
  Body,
  UseInterceptors,
  UploadedFiles,Param,Patch
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

import { UpdateProfileDto } from './dto/update-profile.dto'
import { SetPasswordDto } from './dto/set-password.dto'

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // Register endpoint
@Post('register')
@UseInterceptors(
  FileFieldsInterceptor(
    [
      { name: 'photo', maxCount: 1 },
      { name: 'file', maxCount: 1 },
    ],
    { dest: './uploads' },
  ),
)
async register(
  @Body() data: RegisterDto,
  @UploadedFiles() files?: { photo?: Express.Multer.File[]; file?: Express.Multer.File[] },
) {
  const photo = files?.photo?.[0] // will be undefined if not present
  const file = files?.file?.[0]   // will be undefined if not present

  return this.authService.register(data, { photo, file })
}


  // Login endpoint
  @Post('login')
  async login(@Body() data: LoginDto) {
    return this.authService.login(data);
  }

 @Patch('update/:id')
  @UseInterceptors(FileFieldsInterceptor([{ name: 'file', maxCount: 1 }]))
  async updateProfile(
    @Param('id') id: string,
    @Body() data: UpdateProfileDto,
    @UploadedFiles() files?: { file?: Express.Multer.File[] },
  ) {
    const file = files?.file?.[0]
    return this.authService.updateProfile(Number(id), data, file)
  }



@Patch('set-password/:id')
async setPassword(
  @Param('id') id: string,
  @Body() data: SetPasswordDto,
) {
  return this.authService.setPassword(Number(id), data.password)
}
  

@Post('send-otp')
async sendOtp(@Body('email') email: string) {
  return this.authService.sendOtp(email);
}

@Post('verify-otp')
async verifyOtp(@Body() body: { email: string, otp: string }) {
  return this.authService.verifyOtp(body.email, body.otp);
}



}
