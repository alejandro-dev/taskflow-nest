import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { envs } from './config/envs';
import { User, UserSchema } from './auth/schemas/auth.schema';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    AuthModule,

    // Configuration .env file
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    // Configuration MongoDB
    MongooseModule.forRoot(envs.DATABASE_URL, {}),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    UsersModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
