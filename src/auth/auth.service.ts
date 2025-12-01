import {
  Injectable,
  UnauthorizedException,
  BadRequestException, NotFoundException, ForbiddenException
} from '@nestjs/common';
import { PrismaService } from 'src/lib/prisma/prisma.service';
import { JwtService } from 'src/lib/jwt/jwt.service';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { UpdateProfileDto } from './dto/update-profile.dto'
import { SpacesService } from '../spaces/spaces.service'
import { randomInt } from 'crypto';
@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private spacesService: SpacesService,
  ) { }

  async register(
    data: RegisterDto,
    files?: { photo?: Express.Multer.File; file?: Express.Multer.File },
  ) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: data.email },
    })
    if (existingUser) {
      throw new BadRequestException('Email already in use')
    }

    let hashedPassword: string | undefined = undefined
    if (data.password) {
      hashedPassword = await bcrypt.hash(data.password, 10)
    }

    let photoPath: string | null = null
    let filePath: string | null = null

    if (files?.photo) photoPath = files.photo.filename
    if (files?.file) filePath = files.file.filename

    const user = await this.prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        name: data.name,
        phone: data.phone,
        role: data.role ?? undefined,
        organization: data.organization,
        photo: photoPath,
        file: filePath,
      },
    })

    const token = this.jwt.sign({
      id: user.id,
      email: user.email,
      role: user.role,
    })

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        role: user.role,
        organization: user.organization,
        photo: user.photo,
        file: user.file,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    }
  }


  async login(data: LoginDto) {
    // Try to find user first

    const latestEvent = await this.prisma.event.findFirst({
      orderBy: { createdAt: 'desc' },
      select: { id: true },
    })

    let latestEventId = latestEvent ? latestEvent.id : null



    let user = await this.prisma.user.findUnique({
      where: { email: data.email },
      include: { speakers: true },
    })

    if (user && user.isBlocked) {
      throw new ForbiddenException('User is blocked')
    }



    let roleData: any = null

    // If user not found, check Sponsor
    if (!user) {
      const sponsor = await this.prisma.sponsor.findFirst({
        where: { email: data.email },
      })

      if (sponsor) {
        const valid = await bcrypt.compare(data.password, sponsor.password || '')
        if (!valid) throw new UnauthorizedException('Invalid credentials')

        roleData = {
          id: sponsor.id,
          email: sponsor.email,
          name: sponsor.name,
          role: sponsor.role,
          Pic_url: sponsor.Pic_url,
          category: sponsor.category,
          createdAt: sponsor.createdAt,
          updatedAt: sponsor.updatedAt,
        }

        return { token: this.jwt.sign({ id: sponsor.id, email: sponsor.email, role: sponsor.role }), user: { ...roleData, sponsorId: sponsor.id, latestEventId: latestEventId } }
      }

      // If no sponsor, check Exhibitor
      const exhibitor = await this.prisma.exhibitor.findFirst({
        where: { email: data.email },
      })

      if (exhibitor) {
        const valid = await bcrypt.compare(data.password, exhibitor.password || '')
        if (!valid) throw new UnauthorizedException('Invalid credentials')

        roleData = {
          id: exhibitor.id,
          email: exhibitor.email,
          name: exhibitor.name,
          role: exhibitor.role,
          picUrl: exhibitor.picUrl,
          createdAt: exhibitor.createdAt,
          updatedAt: exhibitor.updatedAt,
        }

        return { token: this.jwt.sign({ id: exhibitor.id, email: exhibitor.email, role: exhibitor.role }), user: { ...roleData, exhibitorId: exhibitor.id }, latestEventId: latestEventId }
      }

      // No user, sponsor, or exhibitor found
      throw new UnauthorizedException('Invalid credentials')
    }

    // If user exists, check password
    const valid = await bcrypt.compare(data.password, user.password)
    if (!valid) throw new UnauthorizedException('Invalid credentials')

    // Build user response
    const responseUser: any = {
      id: user.id,
      email: user.email,
      name: user.name,
      phone: user.phone,
      role: user.role,
      organization: user.organization,
      photo: user.photo,
      file: user.file,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    }

    if (user.role === 'speaker' && user.speakers.length > 0) {
      responseUser.speakerId = user.speakers[0].id
    }

    const token = this.jwt.sign({ id: user.id, email: user.email, role: user.role })

    return { token, user: responseUser, latestEventId: latestEventId }
  }




async updateProfile(userId: number, data: UpdateProfileDto, file?: Express.Multer.File) {
  const user = await this.prisma.user.findUnique({ where: { id: userId } })
  if (!user) throw new NotFoundException('User not found')

  if (data.phone) {
    const phoneExists = await this.prisma.user.findFirst({
      where: { phone: data.phone, NOT: { id: userId } },
    })
    if (phoneExists) throw new BadRequestException('Phone already in use')
  }

  let fileUrl: string | null = user.file
  if (file) {
    const uploaded = await this.spacesService.uploadFile(
      file.originalname,
      file.buffer,
      file.mimetype,
    )
    fileUrl = uploaded.url
  }

  const updated = await this.prisma.user.update({
    where: { id: userId },
    data: {
      name: data.name ?? user.name,
      phone: data.phone ?? user.phone,
      organization: data.organization ?? user.organization,
      bio: data.bio ?? user.bio,
      file: fileUrl,
    },
  })

  return {
    message: 'Profile updated successfully',
    user: {
      id: updated.id,
      phone: updated.phone,
      name: updated.name,
      organization: updated.organization,
      bio: updated.bio,
      file: updated.file,
      updatedAt: updated.updatedAt,
    },
  }
}



  async setPassword(userId: number, newPassword: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } })
    if (!user) throw new NotFoundException('User not found')

    const hashedPassword = await bcrypt.hash(newPassword, 10)

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    })

    return { message: 'Password updated successfully' }
  }




async sendOtp(email: string) {
  const user = await this.prisma.user.findUnique({ where: { email } })
  if (!user) throw new NotFoundException('User not found')

  const otp = Math.floor(100000 + Math.random() * 900000).toString()
  const expiry = new Date()
  expiry.setMinutes(expiry.getMinutes() + 10)

  await this.prisma.user.update({
    where: { email },
    data: { otp, otpExpiry: expiry },
  })

  return {
    message: 'OTP generated successfully',
    otp, 
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      // include other non-sensitive fields you want
    }
  }
}



async verifyOtp(email: string, otp: string) {
  const user = await this.prisma.user.findUnique({ where: { email } });
  if (!user) throw new NotFoundException('User not found');

  if (user.otp !== otp) throw new BadRequestException('Invalid OTP');
  if (!user.otpExpiry || user.otpExpiry < new Date()) throw new BadRequestException('OTP expired');

  await this.prisma.user.update({
    where: { email },
    data: { otp: null, otpExpiry: null },
  });

  return { message: 'OTP verified successfully' };
}


}