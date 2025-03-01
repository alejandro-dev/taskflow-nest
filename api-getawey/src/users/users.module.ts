import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { Services } from 'src/enums/services.enum';
import { envs } from 'src/config/envs';
import { QueuesEnum } from 'src/enums/queues.enum';

@Module({
  controllers: [UsersController],
  providers: [],
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
         }
      ])
   ]
})
export class UsersModule {}
