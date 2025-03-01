import { BadRequestException, Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { RedisService } from './redis.service'; // RedisService extraído
import { EmailService } from './email.service'; // EmailService extraído
import { catchError, firstValueFrom } from 'rxjs';
import { Services } from 'src/enums/services.enum';

@Injectable()
export class NotificationsService implements OnModuleInit {
   constructor(
      @Inject(Services.AUTH_SERVICE) private readonly authService: ClientProxy,
      private readonly redisService: RedisService,   // Inyección del servicio Redis
      private readonly emailService: EmailService,   // Inyección del servicio Email
   ) {}

   onModuleInit() {
      // Suscriber to the events from Redis
      this.redisService.subscribeToEvents({
         'user.register': this.handleUserRegister,
         'task.assigned': this.handleTaskAssigned,
      });
   }

   // Manejador para el evento de registro de usuario
   async handleUserRegister(message: string) {
      const { email } = JSON.parse(message);
      await this.emailService.sendEmail(email, 'Gracias por registrarte en nuestra plataforma');
   }

   // Manejador para el evento de tarea asignada
   async handleTaskAssigned(message: string) {
      const { userId, taskTitle } = JSON.parse(message);

      const response = await this.consultEmail(userId);
      const { email } = response.user;

      const messageEmail = `Hola ${email}, se te ha asignado la tarea de ${taskTitle} a ti`;

      await this.emailService.sendEmail(email, messageEmail);
   }

   // Consultar el correo electrónico desde el microservicio de usuarios
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
