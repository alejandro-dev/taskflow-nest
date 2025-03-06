import { Injectable, NestInterceptor, ExecutionContext, CallHandler, BadRequestException } from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { RpcException } from '@nestjs/microservices';

@Injectable()
export class RpcExceptionInterceptor implements NestInterceptor {
   intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
      return next.handle().pipe(
         map((response) => {
            // Si la respuesta contiene un error, ajustamos el código de estado HTTP
            if (response && typeof response === 'object' && 'statusCode' in response && response.statusCode >= 400) {
               context.switchToHttp().getResponse().status(response.statusCode);
               const { statusCode, ...rest } = response;
               return rest;
            }
            return response;
         }),
         catchError((error) => {
            if (error instanceof RpcException) {
               const errorResponse = error.getError();

               // Verificamos si errorResponse es un objeto antes de acceder a `status`
               const statusCode = typeof errorResponse === 'object' && 'status' in errorResponse ? errorResponse.status : 500;
               const message = typeof errorResponse === 'object' && 'message' in errorResponse ? errorResponse.message : errorResponse;

               return throwError(() => new BadRequestException({ statusCode, message }));
            }

            return throwError(() => error);
         })
      );
   }
}
