import { Module } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { envs } from 'src/config/envs';
import { QueuesEnum } from 'src/enums/queues.enum';
import { Services } from 'src/enums/services.enum';
import { EmailService } from './email.service';
import { RedisService } from './redis.service';

@Module({
   controllers: [],
   providers: [NotificationsService, EmailService, RedisService],
   imports: [
      // Connect to RMQ with auth service
      ClientsModule.register([
         { 
         name: Services.AUTH_SERVICE, 
         transport: Transport.RMQ,
         options: {
            urls: [envs.RMQ_URL!],
            queue: QueuesEnum.AUTH_QUEUE,
            queueOptions: {
               durable: true,
            },
            noAck: true
         }   
         },
      ])
   ],
   exports: [NotificationsService, EmailService, RedisService],
})
export class NotificationsModule {}
