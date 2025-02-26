import { Catch, ExceptionFilter, ArgumentsHost } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';

@Catch(RpcException)
/**
 * 
 * @description Catch the RpcException and return a response
 * 
 */
export class RpcExceptionFilter implements ExceptionFilter {
   catch(exception: RpcException, host: ArgumentsHost) {
      const errorResponse = exception.getError() as { message: string; status: number };

      // Aquí devolvemos la RpcException misma, no una HttpException
      return {
         message: errorResponse?.message || 'Internal Server Error',
         statusCode: errorResponse?.status || 500,
         status: errorResponse?.status >= 500 ? 'error' : 'fail',
       };
   }
}
