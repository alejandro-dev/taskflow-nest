import { RpcException } from '@nestjs/microservices';
import { HttpStatus } from '@nestjs/common';

export function handleRpcError(error: any) {
    if (error instanceof RpcException) throw error;

    // TODO: cuando sea un servicio real, se debe retornar un throw RpcException
    return new RpcException({
        message: 'Internal Server Error',
        status: HttpStatus.INTERNAL_SERVER_ERROR,
    });
}
