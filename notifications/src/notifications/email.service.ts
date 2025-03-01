import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: 'smtp.mailtrap.io',
      port: 587,
      auth: {
        user: 'your_user',
        pass: 'your_password',
      },
    });
  }

  // Enviar un correo
  async sendEmail(email: string, message: string) {
    await this.transporter.sendMail({
      from: '"TaskFlow" <no-reply@taskflow.com>',
      to: email,
      subject: 'Notificación de TaskFlow',
      text: message,
    });
  }
}
