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
    * @param {number} limit - The number of users to retrieve per page. Defaults to a specified value if not provided.
    * @param {number} page -  The current page number for pagination. The first page is 0.
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
   async findAll(requestId: string, userId: string, limit: number, page: number): Promise<Object | any> {
      try {   
         // Calculate the offset
         const skip = page > 0 ? ((page + 1) - 1) * limit : 0;
         
         // Find all users
         const users = await this.userRepository.findAll(['id', 'email'], limit, skip); 

         // Send de logs to logs microservice and log the event
         await this.loggerService.logInfo(requestId, 'auth', userId, 'users.findAll', 'Users find all successfully', { message: `${ users.length} users were found`, filters: { limit, page } });

         // Return the list of users
         return { status: 'success', users };
         
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
