import { Module } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { envs } from 'src/config/envs';
import { QueuesEnum } from 'src/enums/queues.enum';
import { Services } from 'src/enums/services.enum';

@Module({
  controllers: [],
  providers: [NotificationsService],
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
  ]
})
export class NotificationsModule {}
