import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/auth.schema';

@Injectable()
export class UserRepository {
   constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

   /**
    * 
    * @param email 
    * @returns 
    * @description Find a user by email
    */
   async findByEmail(email: string): Promise<User | null> {
      return this.userModel.findOne({ email }).exec();
   }

   /**
    * 
    * @param email 
    * @param password 
    * @returns 
    * @description Create a new user
    * 
    */
   async createUser(email: string, password: string): Promise<User> {
      try {
         const newUser = new this.userModel({ email, password });
         return newUser.save();

      } catch (error) {
         throw new HttpException('Custom error message', HttpStatus.INTERNAL_SERVER_ERROR);
      }
   }
}
