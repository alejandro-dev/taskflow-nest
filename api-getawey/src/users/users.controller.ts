import { Controller, Get, Inject, UseGuards, Request } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { Services } from 'src/enums/services.enum';
import { AuthGuard } from 'src/guards/auth.guard';
import { LoggerService } from 'src/logs/logs.service';
import { catchError, firstValueFrom } from 'rxjs';

@Controller('users')
export class UsersController {
   constructor(@Inject(Services.AUTH_SERVICE) private readonly usersService: ClientProxy, private readonly loggerService: LoggerService) {}

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
    * @param {any} req - The request object
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
   async findAll(@Request() req: any): Promise<Object | any> {
      // Generate a request id to log the request
      const requestId = uuidv4();
      const userId = req.user.id;

      // Send de logs to logs microservice
      await this.loggerService.logInfo(requestId, 'api-getawey', userId, 'users.findAll', 'Find all user request received');

      // We convert the Observable to a Promise and catch the errors
      return await firstValueFrom(
         this.usersService.send({ cmd: 'users.findAll' }, {requestId, userId}).pipe(
            catchError((error) => {
               throw new RpcException(error.message || 'Error deleting task');
            })
         )
      );
   }
}
