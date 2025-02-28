import { Injectable, OnModuleInit } from '@nestjs/common';
import Redis from 'ioredis';
import * as nodemailer from 'nodemailer';
import { envs } from 'src/config/envs';

@Injectable()
export class NotificationsService implements OnModuleInit {
   private redis: Redis;
   constructor() {
      this.redis = new Redis({
         host: envs.REDIS_HOST,
         port: envs.REDIS_PORT,
      });
   }

   onModuleInit() {
      // Subscribe to the user.register event
      this.redis.subscribe('user.register', 'task.assigned');

      // Listen for messages on the user.register channel
      this.redis.on('message', async (channel, message) => {
         console.log('log1');
         if (channel === 'user.register') {
            const { email } = JSON.parse(message);
            this.sendEmail(email, 'Gracias por registrarte en nuestra plataforma');
         }
         if (channel === 'task.assigned') {
            console.log('Task assigned');
            // Evento de asignación de tarea
            const { taskId, userId, message: notificationMessage } = JSON.parse(message);
            console.log(notificationMessage);
            await this.sendEmail('alex@gmail.com', 'Se te ha asignado una tarea'); // Enviar el correo de notificación
         }
      });
   }

   async sendEmail(email: string, message: string) {
      const transporter = nodemailer.createTransport({
         host: 'smtp.mailtrap.io',
         port: 587,
         auth: {
            user: '0eae631317c030',
            pass: '2cd4c1af306945',
         },
      });
  
      await transporter.sendMail({
         from: '"TaskFlow" <no-reply@taskflow.com>',
         to: email,
         subject: 'Bienvenido a TaskFlow',
         text: message,
      });
  
      console.log(`Correo enviado a ${email}`);
   }
}
