import { Controller, HttpStatus } from '@nestjs/common';
import { UsersService } from './users.service';
import { handleRpcError } from 'src/filters/error-handler.filter';
import { MessagePattern, Payload, RpcException } from '@nestjs/microservices';
import { UsersCacheService } from './users-cache.service';
import { PaginationDto } from './dto/pagination.dto';

@Controller()
export class UsersController {
   constructor(private readonly usersService: UsersService, private readonly usersCacheService: UsersCacheService) {}

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
    * @param {any} payloadBody - The request id and user id
    * @param {string} payloadBody.requestId - The request id
    * @param {string} payloadBody.userId - The user id
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
   async findAll(@Payload() payloadBody: { [key: string]: string }, @Payload() paginationDto: PaginationDto): Promise<Object | any> {
      try {
         // Get requestId and userId from the payloadBody
         const { requestId, userId } = payloadBody;

         // Get limit and page from the paginationDto
         const { limit, page } = paginationDto;

         // Find all users
         return await this.usersCacheService.getUsers(requestId, userId, limit, page);

      } catch (error) {
         handleRpcError(error);
      }
   }

   /**
    * 
    * @param id - The id of the user
    * @returns {Promise<Object | any>} The response contain the operation status and the user
    * 
    * @messagePattern users.findById
    * @description Get a user by id
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
    * // Not found response
    * statusCode: 404
    * {
    *    "status": "fail",
    *    "message": "User not found"    
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
   @MessagePattern({ cmd: 'users.findById' })
   async findById(@Payload('id') id: string): Promise<Object | any> {
      try {
         // Check if the user exists
         const user = await this.usersService.findById(id);

         // If the user doesn't exist, throw an error
         if(!user) throw new RpcException({ message: 'User not found', status: HttpStatus.NOT_FOUND });

         return { status: 'success', user };

      } catch (error) {
         handleRpcError(error);
      }
   }
   
}
