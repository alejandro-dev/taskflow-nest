import { Injectable } from '@nestjs/common';
import { UserRepository } from 'src/auth/auth.repository';
import { handleRpcError } from 'src/filters/error-handler.filter';
import { logAndHandleError } from 'src/helpers/log-helper';
import { LoggerService } from 'src/logs/logs.service';

@Injectable()
export class UsersService {
   // Inject the user repository to communicate with the user repository
	constructor(private readonly userRepository: UserRepository, private readonly loggerService: LoggerService) {}

   /**
    * 
    * @returns {Promise<Object | any>} The list of users
    * @param {string} requestId - The request id
    * @param {string} userId - The user id
    * 
    * @messagePattern users.findAll
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
   async findAll(requestId: string, userId: string): Promise<Object | any> {
      try {
         console.log('requestId', requestId);
         console.log('userId', userId);
         
         // Find all users
         const users = await this.userRepository.findAll(['id', 'email']); 

         // Send de logs to logs microservice and log the event
         console.log('enviando...')
         await this.loggerService.logInfo(requestId, 'auth', userId, 'users.findAll', 'Users find all successfully', { message: `${ users.length} users were found` });
         console.log('enviado')

         // Return the list of users
         return users;
         
      } catch (error) {
         // Return the error to the caller and save the error in the logs
         await logAndHandleError(error, this.loggerService, requestId, 'auth', userId, 'users.findAll');
      }
   }

   /**
    * 
    * @param id - The id of the user
    * @description Find a user by id
    * @returns {Promise<Object | any>} The user found or null if not found
    * 
    * @example
    * // Example success response
    * statusCode: 200
    * {
    *    "status": "success",
    *    "user": {
    *      "id": "1234567890abcdef12345678",
    *      "email": "alex@gmail.com"
    *    }
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
   async findById(id: string): Promise<Object | any> {
      try {
         return await this.userRepository.findById(id, ['email']);
         
      } catch (error) {
         handleRpcError(error);
      }
   }
}
