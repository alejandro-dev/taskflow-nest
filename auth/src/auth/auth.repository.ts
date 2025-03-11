import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/auth.schema';

@Injectable()
export class UserRepository {
   constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

   /**
    * 
    * @param email - The email of the user
    * @description Find a user by email
    * @returns {Promise<User | null>} The user found or null if not found
    *
    */
   async findByEmail(email: string): Promise<User | null> {
      try {
         return this.userModel.findOne({ email }).exec();
         
      } catch (error) {
         throw new HttpException('Custom error message', HttpStatus.INTERNAL_SERVER_ERROR);
      }
   }

   /**
    * 
    * @param id - The id of the user
    * @description Find a user by id
    * @returns {Promise<User | null>} The user found or null if not found
    *
    */
   async findById(id: string, select: string[]): Promise<User | null> {
      try {
         return this.userModel.findById(id).select(select).exec();

      } catch (error) {
         throw new HttpException('Custom error message', HttpStatus.INTERNAL_SERVER_ERROR);
      }
   }

   /**
    * 
    * @param email - The email of the user
    * @param password - The password of the user
    * @description Create a new user
    * @returns {Promise<User>} The created user
    * 
    */
   async createUser(email: string, password: string, token: string): Promise<User> {
      try {
         const newUser = new this.userModel({ email, password, token });
         return newUser.save();

      } catch (error) {
         throw new HttpException('Custom error message', HttpStatus.INTERNAL_SERVER_ERROR);
      }
   }

   /**
    * 
    * @description Get all users
    * @param {string[]} select - The values selected of the users to query
    * @param {number} limit - The limit of the users
    * @param {number} skip - The skip of the users
    * @param {number} limit - The number of users to retrieve per page. Defaults to a specified value if not provided.
    * @param {number} skip -  The current page number for pagination. The first page is 0.
    * @returns {Promise<User[]>} The list of users
    *
    */
   async findAll(select: string[], limit: number, skip: number): Promise<User[]> {
      try {
         const query = this.userModel.find({ active: true }).select(select);

         // If limit and skip are provided, add them to the query
         if(limit > 0 && skip >= 0) query.skip(skip).limit(limit);

         return query.exec();

      } catch (error) {
         throw new HttpException('Custom error message', HttpStatus.INTERNAL_SERVER_ERROR);
      }
   }

   /**
    * 
    * @param token - The token of the user
    * @description Find a user by token
    * @returns {Promise<User | null>} The user found or null if not found
    */
   async findByTokenNotActive(token: string): Promise<User | null> {
      try {
         // Get user by token and check if the user is active
         return this.userModel.findOne({ token, active: false }).exec();

      } catch (error) {
         throw new HttpException('Custom error message', HttpStatus.INTERNAL_SERVER_ERROR);
      }
   }

   async activeUser(id: string): Promise<User | null> {
      try {
         // Updated the user that active is false and active to true and unset the token
         return this.userModel.findByIdAndUpdate(id, { active: true, $unset: { token: "" } }).exec();

      } catch (error) {
         throw new HttpException('Custom error message', HttpStatus.INTERNAL_SERVER_ERROR);
      }
   }
}
