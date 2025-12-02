import { Injectable } from '@nestjs/common'
import axios from 'axios'
import { BREVO_API_KEY, BREVO_SENDER_EMAIL, BREVO_SENDER_NAME } from './brevo.constants'

@Injectable()
export class BrevoService {
  async sendEmail(to: string, subject: string, htmlContent: string) {
    const data = {
      sender: { name: BREVO_SENDER_NAME, email: BREVO_SENDER_EMAIL },
      to: [{ email: to }],
      subject,
      htmlContent
    }

    const response = await axios.post('https://api.brevo.com/v3/smtp/email', data, {
      headers: { 'api-key': BREVO_API_KEY, 'Content-Type': 'application/json' }
    })

    return response.data
  }

  async sendOtp(to: string, otp: string) {
    const htmlContent = `<p>Your OTP is <strong>${otp}</strong></p>`
    return this.sendEmail(to, 'Your OTP Code', htmlContent)
  }

  async sendTemplateEmail(to: string, templateId: number, params: Record<string, any>) {
    const data = {
      to: [{ email: to }],
      templateId,
      params,
      sender: { name: BREVO_SENDER_NAME, email: BREVO_SENDER_EMAIL }
    }

    const response = await axios.post('https://api.brevo.com/v3/smtp/email', data, {
      headers: { 'api-key': BREVO_API_KEY, 'Content-Type': 'application/json' }
    })

    return response.data
  }
}
