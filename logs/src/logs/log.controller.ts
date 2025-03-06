import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { LogService } from './log.service';

@Controller()
export class LogController {
   constructor(private readonly logService: LogService) {}

   @MessagePattern({ cmd: 'logs.create' })
   create(@Payload() logData: { level: string, message: string, request_id: string, user_id: string, event_type: string, details: any }) {
      return this.logService.handleTaskLogs(logData);
   }
}
