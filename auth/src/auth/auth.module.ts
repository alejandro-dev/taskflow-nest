import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserRepository } from './auth.repository';
import { MongooseModule } from '@nestjs/mongoose';
import { UserSchema, User } from './schemas/auth.schema';
import { JwtModule } from '@nestjs/jwt';
import { envs } from 'src/config/envs';

@Module({
   imports: [
      MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),  
      JwtModule.register({
         secret: envs.JWT_SECRET,
         signOptions: {
         expiresIn: '3h'
         }
      })
   ],
   controllers: [AuthController],
   providers: [AuthService, UserRepository],
})

export class AuthModule {}
