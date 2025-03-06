import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserRepository } from './auth.repository';
import { MongooseModule } from '@nestjs/mongoose';
import { UserSchema, User } from './schemas/auth.schema';
import { JwtModule } from '@nestjs/jwt';
import { envs } from 'src/config/envs';
import { RedisModule } from 'src/redis/redis.module';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { Services } from 'src/enums/services.enum';
import { QueuesEnum } from 'src/enums/queues.enum';
import { LoggerService } from 'src/logs/logs.service';

@Module({
   imports: [
      MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),  
      JwtModule.register({
         secret: envs.JWT_SECRET,
         signOptions: {
            expiresIn: '3h'
         }
      }),
      RedisModule,
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
   ],
   controllers: [AuthController],
   providers: [AuthService, UserRepository, LoggerService],
})

export class AuthModule {}
