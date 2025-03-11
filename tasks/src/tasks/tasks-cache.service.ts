import { Inject, Injectable } from '@nestjs/common';
import Redis from 'ioredis';
import { TasksService } from './tasks.service'; // Servicio donde consultas las tareas en la DB
import { LoggerService } from 'src/logs/logs.service';
import { logAndHandleError } from 'src/helpers/log-helper';
import { RedisKeys } from 'src/enums/redis-keys.enum';

@Injectable()
export class TasksCacheService {
   constructor(@Inject('REDIS_CLIENT') private readonly redis: Redis, private readonly tasksService: TasksService, private readonly loggerService: LoggerService) { }

   /**
    * 
    * @param requestId - The request id
    * @param userId - The user id
    * @param {number} limit - The number of users to retrieve per page. Defaults to a specified value if not provided.
    * @param {number} page -  The current page number for pagination. The first page is 0.
    * 
    * @description Get all tasks from Redis, if not found, query the DB
    * 
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
   async findAllRedis(requestId: string, userId: string, limit: number = 0, page: number = 0): Promise<any> {
      try {
         const redisKey = limit === 0 ? RedisKeys.ALLTASKS : `${RedisKeys.ALLTASKS}:limit=${limit}:page=${page}`;

         // Try to get tasks from Redis
         const cachedTasks = await this.redis.get(redisKey);

         // Task found in Redis, return them
         if (cachedTasks) {
            // Send de logs to logs microservice and log the event
            await this.loggerService.logInfo(requestId, 'tasks', userId, 'tasks.findAll', 'Task find all successfully (Redis)', { message: `${ JSON.parse(cachedTasks).tasks.length} tasks were found`, filter: { limit, page } });

            // Return list of tasks
            return JSON.parse(cachedTasks);
         }

         // If not found in Redis, query the DB
         const tasks = await this.tasksService.findAll(requestId, userId, limit, page);

         // Save tasks in Redis for 1 hour
         await this.redis.set(redisKey, JSON.stringify(tasks), 'EX', 3600);

         return tasks;
      
      } catch (error) {
         // Return the error to the caller and save the error in the logs
         await logAndHandleError(error, this.loggerService, requestId, 'tasks', userId, 'tasks.findAll');
      }
   }

   /**
    * 
    * @returns {Object} The response contain the operation status and the task
    * 
    * @description Get tasks from author from Redis, if not found, query the DB
    * 
    * @param {Object} payloadBody - The author id, request id and user id
    * @param {string} payloadBody.authorId - The author id
    * @param {string} payloadBody.requestId - The request id
    * @param {string} payloadBody.userId - The user id
    * @param {number} limit - The number of users to retrieve per page. Defaults to a specified value if not provided.
    * @param {number} page -  The current page number for pagination. The first page is 0.
    * 
    * @example
    * // Example success response
    * statusCode: 200
    * {
    *    "status": "success",
    *    "task": {
    *      "id": "1234567890abcdef12345678",
    *      "title": "Task title",
    *      "description": "Task description",
    *      "assignedTo": "1234567890abcdef12345678",
    *      "dueDate": "2025-02-25T00:00:00.000Z",
    *      "status": "pending",
    *      "priority": "media",
    *      "createdAt": "2025-02-25T00:00:00.000Z",
    *      "updatedAt": "2025-02-25T00:00:00.000Z"
    *    }
    * }
    * 
    * @example
    * // Not found response
    * statusCode: 404
    * {
    *    "status": "fail",
    *    "message": "Task not found"
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
   async findByAuthorIdRedis(authorId: string, requestId: string, userId: string, limit: number = 0, page: number = 0): Promise<any> {
      try {
         const redisKey = limit === 0 ? `${RedisKeys.AUTHORTASKS}:${authorId}` : `${RedisKeys.AUTHORTASKS}:${authorId}:limit=${limit}:page=${page}`;


         // Try to get tasks from Redis
         const cachedTasks = await this.redis.get(redisKey);

         // Task found in Redis, return them
         if (cachedTasks) {
            // Send de logs to logs microservice and log the event
            await this.loggerService.logInfo(requestId, 'tasks', userId, 'tasks.findByAuthorId', `Task by author #${authorId} find all successfully`, { message: `${ cachedTasks.length} tasks were found`, filter: { limit, page } } );

            // Return list of tasks
            return JSON.parse(cachedTasks);
         }

         // If not found in Redis, query the DB
         const tasks = await this.tasksService.findByAuthorId(authorId, requestId, userId, limit, page);

         // Save tasks in Redis for 1 hour
         await this.redis.set(redisKey, JSON.stringify(tasks), 'EX', 3600);

         return tasks;
      
      } catch (error) {
         // Return the error to the caller and save the error in the logs
         await logAndHandleError(error, this.loggerService, requestId, 'tasks', userId, 'tasks.findAll');
      }
   }

   /**
    * 
    * @returns {Object} The response contain the operation status and the task
    * 
    * @description Get tasks assigned to user from Redis, if not found, query the DB
    * 
    * @param {Object} payloadBody - The author id, request id and user id
    * @param {string} payloadBody.assignedId - The assigned id
    * @param {string} payloadBody.requestId - The request id
    * @param {string} payloadBody.userId - The user id
    * @param {number} limit - The number of users to retrieve per page. Defaults to a specified value if not provided.
    * @param {number} page -  The current page number for pagination. The first page is 0.
    * 
    * @example
    * // Example success response
    * statusCode: 200
    * {
    *    "status": "success",
    *    "task": {
    *      "id": "1234567890abcdef12345678",
    *      "title": "Task title",
    *      "description": "Task description",
    *      "assignedTo": "1234567890abcdef12345678",
    *      "dueDate": "2025-02-25T00:00:00.000Z",
    *      "status": "pending",
    *      "priority": "media",
    *      "createdAt": "2025-02-25T00:00:00.000Z",
    *      "updatedAt": "2025-02-25T00:00:00.000Z"
    *    }
    * }
    *  
    * @example
    * // Not found response
    * statusCode: 404
    * {
    *    "status": "fail",
    *    "message": "Task not found"
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
   async findByAssignedIdRedis(assignedId: string, requestId: string, userId: string, limit: number = 0, page: number = 0): Promise<any> {
      try {
         const redisKey = limit === 0 ? `${RedisKeys.ASSIGNEDTASK}:${assignedId}` : `${RedisKeys.ASSIGNEDTASK}:${assignedId}:limit=${limit}:page=${page}`;

         // Try to get tasks from Redis
         const cachedTasks = await this.redis.get(redisKey);

         // Task found in Redis, return them
         if (cachedTasks) {
            // Send de logs to logs microservice and log the event
            await this.loggerService.logInfo(requestId, 'tasks', userId, 'tasks.findByAuthorId', `Task by user assigned #${assignedId} find all successfully`, { message: `${cachedTasks.length} tasks were found`, filter: { limit, page } } );

            // Return list of tasks
            return JSON.parse(cachedTasks);
         }

         // If not found in Redis, query the DB
         const tasks = await this.tasksService.findByAuthorId(assignedId, requestId, userId, limit, page);

         // Save tasks in Redis for 1 hour
         await this.redis.set(redisKey, JSON.stringify(tasks), 'EX', 3600);

         return tasks;
      
      } catch (error) {
         // Return the error to the caller and save the error in the logs
         await logAndHandleError(error, this.loggerService, requestId, 'tasks', userId, 'tasks.findAll');
      }
   }
}
