import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User, UserSchema } from 'src/auth/schemas/auth.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { UserRepository } from 'src/auth/auth.repository';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { Services } from 'src/enums/services.enum';
import { envs } from 'src/config/envs';
import { QueuesEnum } from 'src/enums/queues.enum';
import { LoggerService } from 'src/logs/logs.service';

@Module({
   controllers: [UsersController],
   providers: [UsersService, UserRepository, LoggerService],
   imports: [
      MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),  
      // Connect to RMQ with logs service
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
   ]
})
export class UsersModule {}
