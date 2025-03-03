import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import * as fs from 'fs';
import * as path from 'path';
import { envs } from 'src/config/envs';

@Injectable() 
export class EmailService {
   private transporter;

   constructor() {
      this.transporter = nodemailer.createTransport({
         host: envs.MAIL_HOST,
         port: envs.MAIL_PORT,
         auth: {
            user: envs.MAIL_USER,
            pass: envs.MAIL_PASSWORD,
         },
      });
   }

   // Enviar un correo
   async sendEmailOld(email: string, message: string) {
      await this.transporter.sendMail({
         from: '"TaskFlow" <no-reply@taskflow.com>',
         to: email,
         subject: 'Notificación de TaskFlow',
         text: message,
         // html
      });
   }

   async sendEmail (to: string, subject: string, replacements:  Record<string, any>, template: string) {
      try {
         // Leer el archivo HTML
         const filePath = path.join(__dirname, '../../src/notifications/templates', template);
         console.log('Buscando template en:', filePath);

         let html = fs.readFileSync(filePath, 'utf-8');

         // Reemplazar los marcadores en el HTML (por ejemplo, {{name}})
         Object.keys(replacements).forEach(key => {
            const regex = new RegExp(`{{${key}}}`, 'g'); // Crear una expresión regular global
            html = html.replace(regex, replacements[key]);
         });

         const mailOptions = {
            from: '"TaskFlow" <no-reply@taskflow.com>',
            to: to,
            subject: subject,
            html: html
         };

         const info = await this.transporter.sendMail(mailOptions);
         console.log('Correo enviado:', info.response);
          
      } catch (error) {
         console.error('Error al enviar el correo:', error);
      }
  };
}
