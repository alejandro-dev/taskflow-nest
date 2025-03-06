import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { envs } from './config/envs';
import { UsersModule } from './users/users.module';

@Module({
   imports: [
      AuthModule,
      UsersModule,
      // Configuration .env file
      ConfigModule.forRoot({
         isGlobal: true,
      }),

      // Configuration MongoDB
      MongooseModule.forRoot(envs.DATABASE_URL, {}),
   ],
   controllers: [],
   providers: [],
})
export class AppModule {}
