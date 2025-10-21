import { Controller, Get, Query } from '@nestjs/common'
import { AgoraService } from './agora.service'

@Controller('agora')
export class AgoraController {
  constructor(private readonly agoraService: AgoraService) {}

  // API endpoint to get a token for a session
  @Get('token')
  getAgoraToken(
    @Query('channelName') channelName: string,
    @Query('uid') uid: string,
    @Query('role') role: 'host' | 'audience' = 'audience'
  ) {
    if (!channelName || !uid) {
      return { error: 'channelName and uid are required' }
    }

    const tokenData = this.agoraService.generateToken(channelName, uid, role)
    return { success: true, data: tokenData }
  }
}
