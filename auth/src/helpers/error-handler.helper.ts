import { HttpStatus } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';

export function extractErrorDetails(error: any): { status: HttpStatus; message: string } {
    let statusCode: HttpStatus = HttpStatus.INTERNAL_SERVER_ERROR; // Valor por defecto
    let message = 'Internal server error';

    if (error instanceof RpcException) {
        const errorData = error.getError(); // Puede ser string u objeto

        if (typeof errorData === 'object' && errorData !== null) {
            statusCode = ('status' in errorData && typeof errorData.status === 'number') 
                ? (errorData.status as HttpStatus) 
                : HttpStatus.INTERNAL_SERVER_ERROR;

            message = ('message' in errorData && typeof errorData.message === 'string') 
                ? errorData.message 
                : message;
        } else if (typeof errorData === 'string') {
            message = errorData;
        }
    } else if (error.response && error.response.statusCode) {
        statusCode = error.response.statusCode;
        message = error.response.message || message;
    } else if (error.statusCode) {
        statusCode = error.statusCode;
        message = error.message || message;
    }

    return { status: statusCode, message };
}