import { Controller } from '@nestjs/common';
import { UsersService } from './users.service';
import { handleRpcError } from 'src/filters/error-handler.filter';
import { MessagePattern } from '@nestjs/microservices';

@Controller()
export class UsersController {
   constructor(private readonly usersService: UsersService) {}

   /**
     * 
     * @description Healthcheck endpoint to check if the service is up and running
     * @messagePattern users.healt
   */
   @MessagePattern({ cmd: 'users.healt' })
   healt() {
       return { status: 'success' };
   }

   /**
    * 
    * @returns {Promise<Object | any>} The response contain the operation status and the list of users
    * 
    * @messagePattern users.findAll
    * @description Get all users
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
    */
   @MessagePattern({ cmd: 'users.findAll' })
   async findAll(): Promise<Object | any> {
      try {
         const users = await this.usersService.findAll();
         return { status: 'success', users };

      } catch (error) {
         handleRpcError(error);
      }
   }
}
