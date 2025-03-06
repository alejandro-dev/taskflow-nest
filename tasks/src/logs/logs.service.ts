import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { catchError } from 'rxjs';
import { Services } from 'src/enums/services.enum';

@Injectable()
// Service to log events
export class LoggerService {
   constructor(@Inject(Services.LOGS_SERVICE) private readonly logsClient: ClientProxy) {}

   /**
    * 
    * @param {string} requestId - The request id
    * @param {string} serviceName - The name of the service
    * @param {string} user_id - The user id or any data from user
    * @param {string} eventType - The event type
    * @param {any} error - The error
    * @description Log an error event
    */
   async logError(requestId: string, serviceName: string, user_id: string, eventType: string, error: any) {
      const logData = {
         level: 'ERROR',
         message: error.message || 'Un error ocurrió',
         request_id: requestId, 
         user_id: user_id,
         event_type: eventType,
         service_name: serviceName,
         details: {
            error: error.message ,
            stack: error.stack,
         } ,
      };

      // Send de logs to logs microservice
      this.sendLog(logData);
   }

   /**
    * 
    * @param {string} requestId - The request id
    * @param {string} serviceName - The name of the service
    * @param {string} user_id - The user id
    * @param {string} eventType - The event type
    * @param {string} message - Message to log
    * @param {string} details - Any data from user. Is optional
    */
   async logInfo(requestId: string, serviceName: string, user_id: string, eventType: string, message: string, details?: any) {
      // Send de logs to logs microservice
      const logData = {
         level: 'INFO',
         message: message,
         request_id: requestId, 
         user_id: user_id,
         event_type: eventType,
         service_name: serviceName,
         details
      };

      // Send de logs to logs microservice
      this.sendLog(logData);
   }

   // Function to send logs to the logs microservice
   async sendLog(logData: any){
      this.logsClient.emit({ cmd: 'logs.create' }, logData).pipe(
         catchError((error) => {
            console.error('Error sending log:', error);
            throw new BadRequestException(error.message || 'Error saving log');
         }),
      ).subscribe();
   }
}
