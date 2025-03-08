import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { LogService } from './log.service';

@Controller()
export class LogController {
   constructor(private readonly logService: LogService) {}

   /**
    * 
    * @messagePattern logs.create
    * @param {Object} logData - The log data
    * @param {string} logData.level - The log level (INFO, ERROR, WARN)
    * @param {string} logData.message - The log message
    * @param {string} logData.request_id - The request id. Identifies the request
    * @param {string} logData.user_id - The user id
    * @param {string} logData.event_type - The event type
    * @param {string} logData.service_name - The service name
    * @param {any} logData.details - The details of the log 
    * @description Create a log
    * 
    */
   @MessagePattern({ cmd: 'logs.create' })
   create(@Payload() logData: { level: string, message: string, request_id: string, user_id: string, event_type: string, service_name: string, details: any }) {
      return this.logService.createLog(logData);
   }
}
