import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User, UserSchema } from 'src/auth/schemas/auth.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { UserRepository } from 'src/auth/auth.repository';

@Module({
  controllers: [UsersController],
  providers: [UsersService, UserRepository],
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),  
  ]
})
export class UsersModule {}
