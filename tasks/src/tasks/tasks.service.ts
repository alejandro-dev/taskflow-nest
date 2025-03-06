import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import Redis from 'ioredis';
import { UpdateTaskDto } from './dto/update-task.dto';
import { PrismaService } from 'prisma/prisma.service';
import { ChangeStatusDto } from './dto/change-status.dto';
import { AssignUserDto } from './dto/assign-user.dto';
import { handleRpcError } from './filters/error-handler.filter';
import { CreateTaskRequestDto } from './dto/create-task-request.dto';
import { LoggerService } from 'src/logs/logs.service';
import { logAndHandleError } from 'src/helpers/log-helper';

@Injectable()
export class TasksService {
   constructor(private prisma: PrismaService, @Inject('REDIS_CLIENT') private readonly redis: Redis, private readonly loggerService: LoggerService) {}

   /**
    * 
    * @description Create a new task
    * @param createTaskRequestDto - The task data to create a new task with the request id
    * @param createTaskRequestDto.requestId - The request id
    * @param createTaskRequestDto.createTaskDto - The task data to create a new task 
    * @param createTaskRequestDto.createTaskDto.title - The title of the task
    * @param createTaskRequestDto.createTaskDto.description - The description of the task
    * @param createTaskRequestDto.createTaskDto.assignedTo - The id of the user assigned to the task
    * @param createTaskRequestDto.createTaskDto.dueDate - The due date of the task
    * @param createTaskRequestDto.createTaskDto.status - The status of the task
    * @param createTaskRequestDto.createTaskDto.priority - The priority of the task
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
   async create(createTaskRequestDto: CreateTaskRequestDto): Promise<Object | any> {
      try {
         // Get the request id and the task data from the dto
			const { createTaskDto, requestId } = createTaskRequestDto;

         const task = await this.prisma.task.create({
            data: {
              title: createTaskRequestDto.createTaskDto.title,
              description: createTaskRequestDto.createTaskDto.description || null,
              authorId: createTaskRequestDto.createTaskDto.authorId,
              assignedUserId: createTaskRequestDto.createTaskDto.assignedUserId || null
            },
         });

         // If the task has an assigned user, publish the message to the task.assigned channel
         if(createTaskRequestDto.createTaskDto.assignedUserId) {
            const notificationData = {
               userId: createTaskRequestDto.createTaskDto.assignedUserId,
               taskTitle: task.title,
               taskDescription: task.description,
            }
            await this.redis.publish('task.assigned', JSON.stringify(notificationData));
         }
         
         // Send de logs to logs microservice and log the event
			await this.loggerService.logInfo(requestId, 'tasks', createTaskRequestDto.createTaskDto.authorId, 'tasks.create', 'Task created successfully', { ...task });

         return { status: 'success', task, message: 'Task created successfully' };

      } catch (error) {
         // Return the error to the caller and save the error in the logs
			await logAndHandleError(error, this.loggerService, createTaskRequestDto?.requestId, 'tasks', createTaskRequestDto?.createTaskDto.authorId, 'tasks.create');
      }
   } 

   /**
    * 
    * @returns {Promise<Object | any>} The response contain the operation status and the list of tasks
    * @param requestId - The request id
    * @param userId - The user id
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
   async findAll(requestId: string, userId: string): Promise<Object | any> {
      try {
         const tasks = await this.prisma.task.findMany();

         // Send de logs to logs microservice and log the event
         await this.loggerService.logInfo(requestId, 'tasks', userId, 'tasks.findAll', 'Task find all successfully (Redis)', { message: `${ tasks.length} tasks were found` });

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
               id
            }
         });

         // If the task doesn't exist, throw an error
         if(!task) throw new RpcException({ message: 'Task not found', status: HttpStatus.NOT_FOUND });

         return { status: 'success', task };

      } catch (error) {
         handleRpcError(error);
      }
   }

   async findByAuthorId(authorId: string): Promise<Object | any> {
      try {
         const task = await this.prisma.task.findMany({
            where: {
               authorId
            }
         });

         // If the task doesn't exist, throw an error
         if(!task) throw new RpcException({ message: 'Task not found', status: HttpStatus.NOT_FOUND });

         return { status: 'success', tasks: task };

      } catch (error) {
         handleRpcError(error);
      }
   }

   async findByAssignedId(assignedUserId: string): Promise<Object | any> {
      try {
         const task = await this.prisma.task.findMany({
            where: {
               assignedUserId
            }
         });

         // If the task doesn't exist, throw an error
         if(!task) throw new RpcException({ message: 'Task not found', status: HttpStatus.NOT_FOUND });

         return { status: 'success', tasks: task };

      } catch (error) {
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
               id
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
   async assignUser(assignUserrDto: AssignUserDto): Promise<Object | any> {
      try {
         // Check if the task exists
         const task = await this.prisma.task.findUnique({
            where: {
               id: assignUserrDto.id
            }
         });

         // If the task doesn't exist, throw an error
         if(!task) throw new RpcException({ message: 'Task not found', status: HttpStatus.NOT_FOUND });

         // Update the task
         const taskUpdated = await this.prisma.task.update({
            where: {
               id: assignUserrDto.id
            },
            data: {
               assignedUserId: assignUserrDto.assignedUserId
            }
         });

         // If the task has an assigned user, publish the message to the task.assigned channel
         const notificationData = {
            userId: taskUpdated.assignedUserId,
            taskTitle: taskUpdated.title,
            taskDescription: taskUpdated.description,
         }

         await this.redis.publish('task.assigned', JSON.stringify(notificationData));
         // this.redis.quit();

         return { status: 'success', task: taskUpdated, message: 'Task author updated successfully' };

      } catch (error) {
         handleRpcError(error);
      }
   }
}
