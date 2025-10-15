import { Controller, Post, Body } from '@nestjs/common'
import { BrevoService } from './brevo.service'
import { AddBrevoUserDto } from './dto/add-brevo-user.dto'

@Controller('brevo')
export class BrevoController {
  constructor(private readonly brevoService: BrevoService) {}

  // register user and sync to Brevo
  @Post('register')
  async register(@Body() dto: AddBrevoUserDto) {
    return this.brevoService.registerUser(dto)
  }
}
