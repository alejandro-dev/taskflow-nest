import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { Services } from 'src/enums/services.enum';
import { QueuesEnum } from 'src/enums/queues.enum';
import { envs } from 'src/config/envs';

@Module({
  controllers: [AuthController],
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
export class AuthModule {}
