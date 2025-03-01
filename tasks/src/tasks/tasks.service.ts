import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { PrismaService } from 'prisma/prisma.service';
import { RpcException } from '@nestjs/microservices';
import { handleRpcError } from './filters/error-handler.filter';
import Redis from 'ioredis';
import { ChangeStatusDto } from './dto/change-status.dto';
import { AssignAuthorDto } from './dto/assign-author.dto';

@Injectable()
export class TasksService {
   constructor(private prisma: PrismaService, @Inject('REDIS_CLIENT') private readonly redis: Redis) {}

   /**
    * 
    * @description Create a new task
    * @param createTaskDto - The task data to create a new task 
    * @param createTaskDto.title - The title of the task
    * @param createTaskDto.description - The description of the task
    * @param createTaskDto.assignedTo - The id of the user assigned to the task
    * @param createTaskDto.dueDate - The due date of the task
    * @param createTaskDto.status - The status of the task
    * @param createTaskDto.priority - The priority of the task
    * 
    * @returns {Promise<Object | any>} The response contain the operation status and the created task
    * 
    * @example
    * // Example success response
    * statusCode: 200
    * {
    *    "status": "success",
    *    "message": "Task created successfully",
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
    * // Example bad request response
    * statusCode: 400
    * {
    *    "status": "fail",
    *    "error": "Your request is invalid",
    *    "message": [
    *      "title is not allowed to be empty",
    *      "title must be a string"
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
   async create(createTaskDto: CreateTaskDto): Promise<Object | any> {
      try {
         const task = await this.prisma.task.create({
            data: {
              title: createTaskDto.title,
              description: createTaskDto.description || null,
              assignedTo: createTaskDto.assignedTo || null
            },
         });

         // If the task has an assigned user, publish the message to the task.assigned channel
         if(createTaskDto.assignedTo) {
            const notificationData = {
               message: 'Task created successfully',
               taskId: task.id,
               userId: createTaskDto.assignedTo
            }
            await this.redis.publish('task.assigned', JSON.stringify(notificationData));
            this.redis.quit();
         }
         

         return { status: 'success', task, message: 'Task created successfully' };

      } catch (error) {
         handleRpcError(error);
      }
   } 

   /**
    * 
    * @returns {Promise<Object | any>} The response contain the operation status and the list of tasks
    * 
    * @messagePattern tasks.findAll
    * @description Get all tasks
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
   async findAll(): Promise<Object | any> {
      try {
         const tasks = await this.prisma.task.findMany();
         return { status: 'success', tasks };

      } catch (error) {
         handleRpcError(error);
      }
   }

   /**
    * 
    * @returns {Promise<Object | any>} The response contain the operation status and the task
    * 
    * @messagePattern tasks.findOne
    * @description Get a task by id
    * @param id - The id of the task
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
    * // Internal Server Error response
    * statusCode: 500
    * {
    *    "status": "error",
    *    "message": "Internal Server Error"
    * }
    * 
    */
   async findOne(id: string): Promise<Object | any> {
      try {
         const task = await this.prisma.task.findUnique({
            where: {
               id: id
            }
         });

         // If the task doesn't exist, throw an error
         if(!task) throw new RpcException({ message: 'Task not found', status: HttpStatus.NOT_FOUND });

         return { status: 'success', task };

      } catch (error) {
         console.log('log3');
         console.log(error);
         handleRpcError(error);
      }
   }

   /**
    * 
    * @param updateTaskDto - The task data to update a task
    * @param updateTaskDto.id - The id of the task
    * @param updateTaskDto.title - The title of the task
    * @param updateTaskDto.description - The description of the task
    * @param updateTaskDto.assignedTo - The id of the user assigned to the task
    * @param updateTaskDto.dueDate - The due date of the task
    * @param updateTaskDto.status - The status of the task
    * @param updateTaskDto.priority - The priority of the task
    * @returns {Promise<Object | any>} The response contain the operation status and the updated task
    * 
    * @messagePattern tasks.update
    * @description Update a task by id
    * 
    * @example
    * // Example success response
    * statusCode: 200
    * {
    *    "status": "success",
    *    "task": {
    *      "id": "1234567890abcdef12345678",
    *      "title": "Task title"
    *    }
    * }
    * 
    * @example
    * // Example bad request response
    * statusCode: 400
    * {
    *    "status": "fail",
    *    "error": "Your request is invalid",
    *    "message": [
    *      "title is not allowed to be empty",
    *      "title must be a string"
    *    ]
    * } 
    * 
    * @example
    * // Not found task response
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
    */
   async update(updateTaskDto: UpdateTaskDto): Promise<Object | any> {
      try {
         const task = await this.prisma.task.findUnique({
            where: {
               id: updateTaskDto.id
            }
         });

         // If the task doesn't exist, throw an error
         if(!task) throw new RpcException({ message: 'Task not found', status: HttpStatus.NOT_FOUND });

         const taskUpdated = await this.prisma.task.update({
            where: {
               id: updateTaskDto.id
            },
            data: updateTaskDto
         });

         return { status: 'success', task: taskUpdated, message: 'Task updated successfully' };

      } catch (error) {
         handleRpcError(error);
      }
      return `This action updates a #${updateTaskDto.id} task`;
   }

   /**
    * 
    * @returns {Promise<Object | any>} The response contain the operation status and the message
    * 
    * @messagePattern tasks.delete
    * @description Delete a task by id
    * 
    * @example
    * // Example success response
    * statusCode: 200
    * {
    *    "status": "success",
    *    "message": "The task #1234567890abcdef12345678 has been deleted"
    * }
    * 
    * @example
    * // Not found task response
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
   async remove(id: string): Promise<Object | any> {
      try {
         // Check if the task exists
         const task = await this.prisma.task.findUnique({
            where: {
               id: id
            }
         });

         // If the task doesn't exist, throw an error
         if(!task) throw new RpcException({ message: 'Task not found', status: HttpStatus.NOT_FOUND });

         // Delete the task
         await this.prisma.task.delete({
            where: {
               id: id
            }
         });

         return { status: 'success', message: `The task #${id} has been deleted` };

      } catch (error) {
         handleRpcError(error);
      }
   }

   /**
    * 
    * @returns {Promise<Object | any>} The response contain the operation status and the updated task
    * 
    * @description Change the status of a task by id
    * 
    * @param changeStatusDto - The task data to change the status of a task
    * @param changeStatusDto.id - The id of the task
    * @param changeStatusDto.status - The status of the task
    * 
    * @example
    * // Example success response
    * statusCode: 200
    * {
    *    "status": "success",
    *    "message": "Task updated successfully"
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
    *   }
    * }
    * 
    * @example
    * // Not found task response
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
    */
   async changeStatus(changeStatusDto: ChangeStatusDto): Promise<Object | any> {
      try {
         // Check if the task exists
         const task = await this.prisma.task.findUnique({
            where: {
               id: changeStatusDto.id
            }
         });

         // If the task doesn't exist, throw an error
         if(!task) throw new RpcException({ message: 'Task not found', status: HttpStatus.NOT_FOUND });

         // Update the task
         const taskUpdated = await this.prisma.task.update({
            where: {
               id: changeStatusDto.id
            },
            data: {
               status: changeStatusDto.status
            }
         });

         return { status: 'success', task: taskUpdated, message: 'Task stastus updated successfully' };

      } catch (error) {
         handleRpcError(error);
      }
   }

   /**
    * 
    * @returns {Promise<Object | any>} The response contain the operation status and the updated task
    * 
    * @description Assign the author of a task by id
    *
    * @param assignAuthorDto - The task data to assign the author of a task
    * @param assignAuthorDto.id - The id of the task
    * @param assignAuthorDto.assignedTo - The id of the user assigned to the task
    * 
    * @messagePattern tasks.assign-author
    *
    * @example
    * // Example success response
    * statusCode: 200
    * {
    *    "status": "success",
    *    "message": "Task author updated successfully"
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
    *   }
    * }
    * 
    * @example
    * // Not found task response
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
    */
   async assignAuthor(assignAuthorDto: AssignAuthorDto): Promise<Object | any> {
      try {
         // Check if the task exists
         const task = await this.prisma.task.findUnique({
            where: {
               id: assignAuthorDto.id
            }
         });

         // If the task doesn't exist, throw an error
         if(!task) throw new RpcException({ message: 'Task not found', status: HttpStatus.NOT_FOUND });

         // Update the task
         const taskUpdated = await this.prisma.task.update({
            where: {
               id: assignAuthorDto.id
            },
            data: {
               assignedTo: assignAuthorDto.assignedTo
            }
         });

         // If the task has an assigned user, publish the message to the task.assigned channel
         const notificationData = {
            message: 'Task updated successfully',
            taskTitle: task.title,
            userId: taskUpdated.assignedTo
         }

         await this.redis.publish('task.assigned', JSON.stringify(notificationData));
         // this.redis.quit();

         return { status: 'success', task: taskUpdated, message: 'Task author updated successfully' };

      } catch (error) {
         console.log(error);
         handleRpcError(error);
      }
   }
}
