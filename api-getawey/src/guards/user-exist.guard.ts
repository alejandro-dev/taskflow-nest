import { CanActivate, ExecutionContext, Injectable, HttpException, HttpStatus, Inject, InternalServerErrorException } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { catchError, firstValueFrom } from 'rxjs';
import { Services } from 'src/enums/services.enum';

/**
 * 
 * UserExistGuard
 * 
 * @description Guard to check if exist user
 * @returns {boolean} True if the user has access to the task, false otherwise
 */
@Injectable()
export class UserExistGuard implements CanActivate {
   constructor(@Inject(Services.AUTH_SERVICE) private readonly usersService: ClientProxy) {}

   async canActivate(context: ExecutionContext): Promise<boolean> {
      const request = context.switchToHttp().getRequest();
      const userId = request.params.id; 

      // Get the user from the task microservice
      const response = await firstValueFrom(
         this.usersService.send({ cmd: 'users.findById' }, { id: userId }).pipe(
            catchError((error) => {
               throw new InternalServerErrorException(error.message || 'Error getting user');
            })
         )
      );

      // Access to user
      const user = response.user;

      // If the task does not exist, throw an exception
      if (!user) throw new HttpException({ status: "fail", message: "User not found" }, HttpStatus.NOT_FOUND);

      return true;
   }
}
