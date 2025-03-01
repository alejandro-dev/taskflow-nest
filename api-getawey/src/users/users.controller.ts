import { Controller, Get, Post, Body, Patch, Param, Delete, Inject, UseGuards } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { Services } from 'src/enums/services.enum';
import { AuthGuard } from 'src/guards/auth.guard';

@Controller('users')
export class UsersController {
   constructor(@Inject(Services.AUTH_SERVICE) private readonly usersService: ClientProxy) {}

   /**
	 * 
	 * @description Healthcheck endpoint to check if the service is up and running
	*/
	@Get('healt')
	healt() {
		return this.usersService.send('users.healt', {});
	} 

   /**
    * 
    * @returns {Promise<Object | any>} The response contain the operation status and the list of users
    * 
    * @param findAllDto - The user data to find all users
    * @param findAllDto.email - The email of the user
    * @param findAllDto.password - The password of the user
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
    * // Unauthorized response
    * statusCode: 401
    * {
    *    "status": "fail",
    *    "message": "Unauthorized",
    * }
    * 
    * @example
    * // Internal Server Error response
    * statusCode: 500
    * {
    *    "status": "error",
    *    "message": "Internal Server Error"
    */
   @UseGuards(AuthGuard)
   @Get()
   findAll() {
      try {
         return this.usersService.send({ cmd: "users.findAll" }, {});

      } catch (error) {
         throw error;
      }
   }
}
