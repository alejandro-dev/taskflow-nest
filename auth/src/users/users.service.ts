import { Injectable } from '@nestjs/common';
import { UserRepository } from 'src/auth/auth.repository';
import { handleRpcError } from 'src/filters/error-handler.filter';

@Injectable()
export class UsersService {
   // Inject the user repository to communicate with the user repository
	constructor(private readonly userRepository: UserRepository) {}

   /**
    * 
    * @returns {Promise<Object | any>} The list of users
    * @description Get all users with the id and email and active status
    * 
    * @example
    * // Example success response
    * statusCode: 200
    * {
    *    "status": "success",
    *    "users": [
    *      {
    *        "id": "1234567890abcdef12345678",
    *        "email": "alex@gmail.com"
    *      }
    *    ]
    * }
    * 
    * @example
    * // Internal Server Error response
    * statusCode: 500
    * {
    *    "status": "error",
    *    "message": "Internal Server Error"
    * }
    *
    */
   async findAll(): Promise<Object | any> {
      try {
         return await this.userRepository.findAll(['id', 'email']); 
         
      } catch (error) {
         handleRpcError(error);
      }
   }
}
