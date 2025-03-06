import { extractErrorDetails } from './error-handler.helper';
import { LoggerService } from 'src/logs/logs.service';
import { handleRpcError } from 'src/filters/error-handler.filter';

export async function logAndHandleError(
    error: any, 
    loggerService: LoggerService, 
    requestId: string = 'unknown', 
    serviceName: string, 
    userId: string = 'unknown', 
    eventType: string
) {
    const { status, message } = extractErrorDetails(error);

    if (status >= 500) {
        await loggerService.logError(requestId, serviceName, userId, eventType, { message, status });
    } else {
        await loggerService.logInfo(requestId, serviceName, userId, eventType, message, { message, status });
    }

    handleRpcError(error);
}
