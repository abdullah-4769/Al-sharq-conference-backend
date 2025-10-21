import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class BrevoService {
  private readonly apiKey = process.env.BREVO_API_KEY;

  async sendEmail(to: string, subject: string, htmlContent: string) {
    const url = 'https://api.brevo.com/v3/smtp/email';

    const data = {
      sender: { email: 'no-reply@yourdomain.com', name: 'Al Sharq Forum' },
      to: [{ email: to }],
      subject,
      htmlContent
    };

    const headers = {
      'accept': 'application/json',
      'api-key': this.apiKey,
      'content-type': 'application/json'
    };

    try {
      const res = await axios.post(url, data, { headers });
      return res.data;
    } catch (error) {
      console.error('Email send failed', error.response?.data || error.message);
      throw error;
    }
  }
}
