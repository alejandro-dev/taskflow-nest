import { Inject, Injectable } from '@nestjs/common';
import Redis from 'ioredis';
import { TasksService } from './tasks.service'; // Servicio donde consultas las tareas en la DB
import { handleRpcError } from './filters/error-handler.filter';

@Injectable()
export class TasksCacheService {
  constructor(@Inject('REDIS_CLIENT') private readonly redis: Redis, private readonly tasksService: TasksService) { }

  /**
   * 
   * @returns Promise<any> Tasks get of Redis
   * @description Get tasks from Redis, if not found, query the DB
   *
   */
  async getTasksForUser(): Promise<any> {
    try {
        const redisKey = `AllTasks`;

        // Try to get tasks from Redis
        const cachedTasks = await this.redis.get(redisKey);

        // Task found in Redis, return them
        if (cachedTasks) return JSON.parse(cachedTasks);

        // If not found in Redis, query the DB
        const tasks = await this.tasksService.findAll();

        // Save tasks in Redis for 1 hour
        await this.redis.set(redisKey, JSON.stringify(tasks), 'EX', 3600);

        return { status: 'success', tasks };
    
    } catch (error) {
        handleRpcError(error);
    }
}

  // Function to invalidate the cache (if necessary)
  async invalidateCache(): Promise<void> {
    const redisKey = `AllTasks`;

    // Delete the key from Redis
    await this.redis.del(redisKey); 
  }
}
