import { Injectable, BadRequestException } from '@nestjs/common'
import { PrismaService } from '../lib/prisma/prisma.service'
import axios from 'axios'
import * as bcrypt from 'bcrypt'
import { AddBrevoUserDto } from './dto/add-brevo-user.dto'

@Injectable()
export class BrevoService {
  // this is your own backend URL, not Brevo API URL
  private readonly baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000'

  constructor(private readonly prisma: PrismaService) {}

  async registerUser(dto: AddBrevoUserDto) {
    if (!dto.email || !dto.password) throw new BadRequestException('Email and password required')

    // check if email exists
    const existingUser = await this.prisma.user.findUnique({ where: { email: dto.email } })
    if (existingUser) throw new BadRequestException('User already exists')

    // hash password before saving
    const hashedPassword = await bcrypt.hash(dto.password, 10)

    // save user in DB
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        password: hashedPassword,
        name: dto.name || '',
        phone: dto.phone || '',
        organization: dto.organization || '',
        role: dto.role || 'participant',
      },
    })

    // Optional: sync to Brevo (if you want)
    await this.sendToBrevo(dto)

    return { message: 'User created successfully', user }
  }

  private async sendToBrevo(dto: AddBrevoUserDto) {
    const brevoKey = process.env.BREVO_API_KEY
    if (!brevoKey) return

    const headers = {
      'api-key': brevoKey,
      'Content-Type': 'application/json',
    }

    const data = {
      email: dto.email,
      attributes: {
        NAME: dto.name,
        PHONE: dto.phone,
        ORGANIZATION: dto.organization,
        ROLE: dto.role,
      },
      updateEnabled: true,
    }

    try {
      await axios.post('https://api.brevo.com/v3/contacts', data, { headers })
    } catch (error) {
      console.log('Brevo sync failed', error.response?.data || error.message)
    }
  }
}
