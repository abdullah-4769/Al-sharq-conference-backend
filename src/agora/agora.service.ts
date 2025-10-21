import { Injectable, InternalServerErrorException } from '@nestjs/common'
import { RtcRole, RtcTokenBuilder } from 'agora-access-token'

@Injectable()
export class AgoraService {
  generateToken(
    channelName: string,
    uid: string | number,
    role: 'host' | 'audience' = 'audience'
  ) {
    const appID = process.env.AGORA_APP_ID
    const appCertificate = process.env.AGORA_APP_CERTIFICATE

    if (!appID || !appCertificate) {
      throw new InternalServerErrorException(
        'Agora App ID or App Certificate is not set in environment variables'
      )
    }

    const expirationTimeInSeconds = 36000
    const currentTimestamp = Math.floor(Date.now() / 1000)
    const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds

    const agoraRole = role === 'host' ? RtcRole.PUBLISHER : RtcRole.SUBSCRIBER

    const token = RtcTokenBuilder.buildTokenWithUid(
      appID,
      appCertificate,
      channelName,
      Number(uid),
      agoraRole,
      privilegeExpiredTs
    )

    return {
      token,
      channelName,
      uid,
      expiresIn: expirationTimeInSeconds,
      role,
    }
  }
}
