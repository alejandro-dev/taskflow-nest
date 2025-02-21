import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class RpcExceptionInterceptor implements NestInterceptor {
   intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
      return next.handle().pipe(
         map((response) => {
            // Verificamos si la respuesta contiene un error y ajustamos el código de estado HTTP
            if (response && response.statusCode && response.statusCode >= 400) {
               context.switchToHttp().getResponse().status(response.statusCode); // Ajustar el código de estado
               const { statusCode, ...rest } = response;
               return rest;
            }
            return response;
         }),
      );
   }
}
