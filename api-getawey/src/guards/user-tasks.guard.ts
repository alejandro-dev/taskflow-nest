import { CanActivate, ExecutionContext, Injectable, ForbiddenException, HttpException, HttpStatus } from '@nestjs/common';

@Injectable()
// Check if the role is user and the ids are equals
export class UserTasksGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean {
        const request = context.switchToHttp().getRequest();
        // Authenticated user
        const user = request.user; 
        
        // Query id
        const requestedId = request.params.id; 

        // If dont haver user return throw
        if (!user) throw new HttpException({ status: "fail", message: "Unauthorized" }, HttpStatus.FORBIDDEN);

        // If is admin or manager user
        if (user.role === 'admin' || user.role === 'manager') return true;

        // If the user is user role only can consult his id
        if (user.role === 'user' && user.id === requestedId) return true;

        throw new HttpException({ status: "fail", message: "You don't have permission to access this task" }, HttpStatus.FORBIDDEN);
    }
}
