import { Inject, Injectable } from '@nestjs/common';
import Redis from 'ioredis';
import { TasksService } from './tasks.service'; // Servicio donde consultas las tareas en la DB
import { handleRpcError } from './filters/error-handler.filter';
import { LoggerService } from 'src/logs/logs.service';

@Injectable()
export class TasksCacheService {
   constructor(@Inject('REDIS_CLIENT') private readonly redis: Redis, private readonly tasksService: TasksService, private readonly loggerService: LoggerService) { }

   /**
    * 
    * @param requestId - The request id
    * @param userId - The user id
    * @returns Promise<any> Tasks get of Redis
    * @description Get tasks from Redis, if not found, query the DB
    * @returns {Promise<any>} The response contain the operation status and the tasks
    * 
    * @example
    * // Example success response
    * statusCode: 200
    * {     
    *    "status": "success",
    *    "tasks": [
    *      {
    *        "id": "1234567890abcdef12345678",
    *        "title": "Task title",
    *        "description": "Task description",
    *        "assignedTo": "1234567890abcdef12345678",
    *        "dueDate": "2025-02-25T00:00:00.000Z",
    *        "status": "pending",
    *        "priority": "media",
    *        "createdAt": "2025-02-25T00:00:00.000Z",
    *        "updatedAt": "2025-02-25T00:00:00.000Z"
    *      }
    *    ]
    * } 
    * 
    * @example
    * // Internal Server Error response
    * statusCode: 500
    * {
    *    "status": "error",
    *    "message": "Internal Server Error"  
    * }
    *
   */
   async getTasksForUser(requestId: string, userId: string): Promise<any> {
      try {
         const redisKey = `AllTasks`;

         // Try to get tasks from Redis
         const cachedTasks = await this.redis.get(redisKey);

         // Task found in Redis, return them
         if (cachedTasks) {
            // Send de logs to logs microservice and log the event
            await this.loggerService.logInfo(requestId, 'tasks', userId, 'tasks.findAll', 'Task find all successfully (Redis)', { message: `${ JSON.parse(cachedTasks).tasks.length} tasks were found` });

            // Return list of tasks
            return JSON.parse(cachedTasks);
         }

         // If not found in Redis, query the DB
         const tasks = await this.tasksService.findAll(requestId, userId);

         // Save tasks in Redis for 1 hour
         await this.redis.set(redisKey, JSON.stringify(tasks), 'EX', 3600);

         return { status: 'successsss', tasks };
      
      } catch (error) {
         handleRpcError(error);
      }
   }

   // Function to invalidate the cache (if necessary)
   async invalidateCache(): Promise<void> {
      // Define the Redis key
      const redisKey = `AllTasks`;

      // Delete the key from Redis
      await this.redis.del(redisKey); 
   }
}
