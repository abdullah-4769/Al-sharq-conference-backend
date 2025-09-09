import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from 'src/lib/prisma/prisma.service';
import { JwtService } from 'src/lib/jwt/jwt.service';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
  ) {}

  async register(
    data: RegisterDto,
    files?: { photo?: Express.Multer.File; file?: Express.Multer.File },
  ) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: data.email },
    });
    if (existingUser) {
      throw new BadRequestException('Email already in use');
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    let photoPath: string | null = null;
    let filePath: string | null = null;

    if (files?.photo) {
      photoPath = files.photo.filename;
    }
    if (files?.file) {
      filePath = files.file.filename;
    }

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
    });

    const token = this.jwt.sign({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        role: user.role,
        organization: user.organization,
        photo: user.photo, // return only filename or null
        file: user.file,   // return only filename or null
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    };
  }

  async login(data: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: data.email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const valid = await bcrypt.compare(data.password, user.password);
    if (!valid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const token = this.jwt.sign({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        role: user.role,
        organization: user.organization,
        photo: user.photo, // return only filename
        file: user.file,   // return only filename
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    };
  }
}
