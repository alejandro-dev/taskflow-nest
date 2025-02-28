import { RpcException } from '@nestjs/microservices';
import { HttpStatus, UnauthorizedException } from '@nestjs/common';
import { JsonWebTokenError, TokenExpiredError } from '@nestjs/jwt';

/**
 * 
 * @param error 
 * @description Handle the RpcException and throw a generic Internal Server Error if the error is not an RpcException
 */
export function handleRpcError(error: any) {
    if (error instanceof RpcException) throw error;

    // If the error is not an RpcException, throw a generic Internal Server Error
    throw new RpcException({
        message: 'Internal Server Error',
        status: HttpStatus.INTERNAL_SERVER_ERROR,
    });
}
