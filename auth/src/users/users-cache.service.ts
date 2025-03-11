import { Inject, Injectable } from '@nestjs/common';
import Redis from 'ioredis';
import { LoggerService } from 'src/logs/logs.service';
import { logAndHandleError } from 'src/helpers/log-helper';
import { UsersService } from './users.service';

@Injectable()
export class UsersCacheService {
   constructor(@Inject('REDIS_CLIENT') private readonly redis: Redis, private readonly usersService: UsersService, private readonly loggerService: LoggerService) { }

   /**
    * 
    * @param requestId - The request id
    * @param userId - The user id
    * @param {number} limit - The number of users to retrieve per page. Defaults to a specified value if not provided.
    * @param {number} page -  The current page number for pagination. The first page is 0.
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
   async getUsers(requestId: string, userId: string, limit: number = 0, page: number = 0): Promise<any> {
      try { 
         const redisKey = limit === 0 ? `AllUsers` : `AllUsers:limit=${limit}:page=${page}`;

         // Try to get users from Redis
         const cachedUsers = await this.redis.get(redisKey);

         // Task found in Redis, return them
         if (cachedUsers) {
            // Send de logs to logs microservice and log the event
            await this.loggerService.logInfo(requestId, 'auth', userId, 'users.findAll', 'Users find all successfully (Redis)', { message: `${JSON.parse(cachedUsers).users.length} users were found`, filter: { limit, page } });

            // Return list of users
            return JSON.parse(cachedUsers);
         }

         // If not found in Redis, query the DB
         const users = await this.usersService.findAll(requestId, userId, limit, page);

         // Save users in Redis for 1 hour
         await this.redis.set(redisKey, JSON.stringify(users), 'EX', 3600);

         return users;
      
      } catch (error) {
         // Return the error to the caller and save the error in the logs
         await logAndHandleError(error, this.loggerService, requestId, 'auth', userId, 'users.findAll');
      }
   }
}
