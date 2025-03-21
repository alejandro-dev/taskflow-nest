import { Module } from '@nestjs/common';
import { TasksController } from './tasks.controller';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { Services } from 'src/enums/services.enum';
import { envs } from 'src/config/envs';
import { QueuesEnum } from 'src/enums/queues.enum';
import { LoggerService } from 'src/logs/logs.service';

@Module({
  controllers: [TasksController],
  providers: [LoggerService],
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
         { 
            name: Services.TASKS_SERVICE,
            transport: Transport.RMQ,
            options: {
               urls: [envs.RMQ_URL!],
               queue: QueuesEnum.TASKS_QUEUE,
               queueOptions: {
                  durable: true,
               },
               noAck: true
            }   
         },
         { 
            name: Services.LOGS_SERVICE, 
            transport: Transport.RMQ,
            options: {
               urls: [envs.RMQ_URL!],
               queue: QueuesEnum.LOGS_QUEUE,
               queueOptions: {
                  durable: true,
               },
               noAck: true
            }   
         },
      ])
    ]
})
export class TasksModule {}
