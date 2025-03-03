import { BadRequestException, Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { RedisService } from './redis.service'; // RedisService extraído
import { EmailService } from './email.service'; // EmailService extraído
import { catchError, firstValueFrom } from 'rxjs';
import { Services } from 'src/enums/services.enum';
import { url } from 'inspector';

@Injectable()
export class NotificationsService implements OnModuleInit {
   constructor(
      @Inject(Services.AUTH_SERVICE) private readonly authService: ClientProxy,
      private readonly redisService: RedisService,   // Inyección del servicio Redis
      private readonly emailService: EmailService,   // Inyección del servicio Email
   ) {}

   onModuleInit() {
      // Suscriber to the events from Redis
      // Put the function bind(this) to make sure that the context is correct
      this.redisService.subscribeToEvents({
         'user.register': this.handleUserRegister.bind(this),
         'task.assigned': this.handleTaskAssigned.bind(this),
      });
   }

   // Handle to the event of user register
   async handleUserRegister(message: string) {
      try {
         // Parse the message
         const { email, token } = JSON.parse(message);
         
         // Send email
         await this.emailService.sendEmail(
            'no-reply@taskflow.com',
            'Taskflow - Bienvenido a la plataforma de TaskFlow',
            { email, url: `http://localhost:3000/auth/verify-account/${token}` },
            'verify-account.html'
         );

      } catch (error) {
         console.log('Error al enviar el correo:', error);
      }
   }

   // Handle to the event of task assigned
   async handleTaskAssigned(message: string) {
      // Parse the message
      const { userId, taskTitle, taskDescription } = JSON.parse(message);
      console.log(message)

      // Find the user by id
      const response = await this.consultEmail(userId);
      const { email } = response.user;

      // Send email
      await this.emailService.sendEmail(
         'no-reply@taskflow.com',
         'Taskflow - Nueva tarea asignada',
         { email, taskTitle, taskDescription },
         'assign-auth-task.html'
      );
   }

   // Find the email from the user id
   async consultEmail(id: string) {
      return await firstValueFrom(
         this.authService.send({ cmd: 'users.findById' }, { id }).pipe(
            catchError((error) => {
               throw new BadRequestException(error.message || 'Error finding user by id');
            }),
         ),
      );
   }
}
