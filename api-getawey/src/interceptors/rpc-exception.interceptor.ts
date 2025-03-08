import { Injectable, NestInterceptor, ExecutionContext, CallHandler, HttpException } from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { RpcException } from '@nestjs/microservices';

@Injectable()
export class RpcExceptionInterceptor implements NestInterceptor {
   intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
      return next.handle().pipe(
         map((response) => {
            // If the response contains an error, adjust the HTTP status code
            if (response && typeof response === 'object' && 'statusCode' in response && response.statusCode >= 400) {
               context.switchToHttp().getResponse().status(response.statusCode);

               const status = response.statusCode >= 500 ? 'error' : 'fail';
               return { status, message: response.message || 'An error occurred' };
            }
            return response;
         }),
         catchError((error) => {
            if (error instanceof RpcException) {
               const errorResponse = error.getError();

               // Check if errorResponse is an object before accessing `status`
               const statusCode = typeof errorResponse === 'object' && 'status' in errorResponse ? errorResponse.status : 500;

               // Check if errorResponse is an object before accessing `message`
               const message = typeof errorResponse === 'object' && 'message' in errorResponse ? errorResponse.message : 'Internal server error';

               // Set the status based on the status code
               const status = (statusCode as number) >= 500 ? 'error' : 'fail';

               return throwError(() => new HttpException({ status, message }, (statusCode as number)));
            }

            return throwError(() => error);
         })
      );
   }
}
