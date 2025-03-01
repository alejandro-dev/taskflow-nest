import { Injectable, CanActivate, ExecutionContext, ForbiddenException, HttpException, HttpStatus } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { RolesEnum } from '../enums/roles.enum';

@Injectable()
export class RolesGuard implements CanActivate {
   constructor(private reflector: Reflector) {}

   canActivate(context: ExecutionContext): boolean {
      // Get roles from the reflector
      const requiredRoles = this.reflector.getAllAndOverride<RolesEnum[]>(ROLES_KEY, [
         context.getHandler(),
         context.getClass(),
      ]);

      // If no roles are required, allow access
      if (!requiredRoles) return true;

      // Get the user from the request
      const request = context.switchToHttp().getRequest();
      const user = request['user'];

      // If the user doesn't have the required role, throw an error
      if (!user || !requiredRoles.includes(user.role)) throw new HttpException({ status: "fail", message: "Not authorized" }, HttpStatus.UNAUTHORIZED);

      return true;
   }
}
