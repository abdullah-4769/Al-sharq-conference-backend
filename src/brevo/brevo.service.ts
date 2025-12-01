import { Injectable } from '@nestjs/common';
import nodemailer from 'nodemailer';
import { BREVO_SENDER_EMAIL, BREVO_SENDER_NAME } from './brevo.constants';

@Injectable()
export class BrevoService {
  private transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: 'smtp-relay.brevo.com',
      port: 587,
      secure: false,
      auth: {
        user: BREVO_SENDER_EMAIL,
        pass: process.env.BREVO_API_KEY
      },
      tls: {
        rejectUnauthorized: false
      }
    });
  }

  async sendEmail(to: string, subject: string, htmlContent: string) {
    return this.transporter.sendMail({
      from: `"${BREVO_SENDER_NAME}" <${BREVO_SENDER_EMAIL}>`,
      to,
      subject,
      html: htmlContent
    });
  }

  async sendOtp(to: string, otp: string) {
    const subject = 'Your OTP Code';
    const html = `<p>Your OTP is <strong>${otp}</strong></p>`;
    return this.sendEmail(to, subject, html);
  }

  async sendNotification(to: string, message: string) {
    const subject = 'Notification';
    const html = `<p>${message}</p>`;
    return this.sendEmail(to, subject, html);
  }

  async sendInvitation(to: string, event: string, date: string) {
    const subject = 'You are Invited';
    const html = `<p>You are invited to <strong>${event}</strong> on <strong>${date}</strong>.</p>`;
    return this.sendEmail(to, subject, html);
  }
}
