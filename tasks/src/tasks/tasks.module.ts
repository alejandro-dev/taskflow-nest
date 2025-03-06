import { Module } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { TasksController } from './tasks.controller';
import { PrismaService } from 'prisma/prisma.service';
import { RedisModule } from 'src/redis/redis.module';
import { TasksCacheService } from './tasks-cache.service';
import { LoggerService } from 'src/logs/logs.service';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { Services } from 'src/enums/services.enum';
import { envs } from 'src/config/envs';
import { QueuesEnum } from 'src/enums/queuesEnum';

@Module({
   controllers: [TasksController],
   providers: [TasksCacheService, TasksService, PrismaService, LoggerService],
   imports: [
      RedisModule,
      ClientsModule.register([
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
   ],
})
export class TasksModule {}
