import { Module } from '@nestjs/common';
import { LogModule } from './logs/log.module';
import { ConfigModule } from '@nestjs/config';
import { envs } from './config/envs';
import { MongooseModule } from '@nestjs/mongoose';
import { Log, LogSchema } from './logs/schemas/logs.schema';

@Module({
   imports: [
      LogModule,
      // Configuration .env file
      ConfigModule.forRoot({
         isGlobal: true,
      }),

      // Configuration MongoDB
      MongooseModule.forRoot(envs.DATABASE_URL, {})
   ],
   controllers: [],
   providers: [],
})
export class AppModule {}
