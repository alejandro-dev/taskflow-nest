import { HttpStatus, Injectable } from '@nestjs/common';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { PrismaService } from 'prisma/prisma.service';
import { RpcException } from '@nestjs/microservices';
import { handleRpcError } from './filters/error-handler.filter';

@Injectable()
export class TasksService {
   constructor(private prisma: PrismaService) {}

   /**
    * 
    * @param createTaskDto 
    * @returns 
    * 
    * @example
    * {
    *     "title": "Task title",
    *     "description": "Task description",
    *     "assignedTo": "1234567890abcdef12345678",
    *     "dueDate": "2025-02-25T00:00:00.000Z",
    *     "status": "pendiente",
    *     "priority": "media"
    * }
    * @example
    * {
    *     "status": "success",
    *     "task": {
    *         "id": "1234567890abcdef12345678",
    *         "title": "Task title",
    *         "description": "Task description",
    *         "assignedTo": "1234567890abcdef12345678",
    *         "dueDate": "2025-02-25T00:00:00.000Z",
    *         "status": "pendiente",
    *         "priority": "media",
    *         "createdAt": "2025-02-25T00:00:00.000Z",
    *         "updatedAt": "2025-02-25T00:00:00.000Z"
    *     },
    *     "message": "Task created successfully"
    * }
    * @example
    * {
    *     "statusCode": 400,
    *     "error": "Bad Request",
    *     "message": [
    *         "title is not allowed to be empty",
    *         "title must be a string"
    *     ]
    * }
    */
   async create(createTaskDto: CreateTaskDto) {
      try {
         const task = await this.prisma.task.create({
            data: {
              title: createTaskDto.title,
              description: createTaskDto.description || null,
              assignedTo: createTaskDto.assignedTo
            },
         });

         return { status: 'success', task, message: 'Task created successfully' };

      } catch (error) {
         handleRpcError(error);
      }
   } 

   /**
    *    
    * @returns 
    * 
    * @example
    * {
    *     "status": "success",
    *     "tasks": [
    *         {
    *             "id": "1234567890abcdef12345678",
    *             "title": "Task title",
    *             "description": "Task description",
    *             "assignedTo": "1234567890abcdef12345678",
    *             "dueDate": "2025-02-25T00:00:00.000Z",
    *             "status": "pendiente",
    *             "priority": "media",
    *             "createdAt": "2025-02-25T00:00:00.000Z",
    *             "updatedAt": "2025-02-25T00:00:00.000Z"
    *         },
    *         {
    *             "id": "1234567890abcdef12345678",
    *             "title": "Task title",
    *             "description": "Task description",
    *             "assignedTo": "1234567890abcdef12345678",
    *             "dueDate": "2025-02-25T00:00:00.000Z",
    *             "status": "pendiente",
    *             "priority": "media",
    *             "createdAt": "2025-02-25T00:00:00.000Z",
    *             "updatedAt": "2025-02-25T00:00:00.000Z"
    *         }
    *     ]
    * } 
    */
   async findAll() {
      try {
         const tasks = await this.prisma.task.findMany();
         return { status: 'success', tasks };

      } catch (error) {
         console.log(error);
         handleRpcError(error);
      }
   }

   /**
    * 
    * @param id 
    * @returns 
    * 
    * @example
    * {
    *     "status": "success",
    *     "task": {
    *         "id": "1234567890abcdef12345678",
    *         "title": "Task title",
    *         "description": "Task description",
    *         "assignedTo": "1234567890abcdef12345678",
    *         "dueDate": "2025-02-25T00:00:00.000Z",
    *         "status": "pendiente",
    *         "priority": "media",
    *         "createdAt": "2025-02-25T00:00:00.000Z",
    *         "updatedAt": "2025-02-25T00:00:00.000Z"
    *     }
    * }
    * @example
    * {
    *     "statusCode": 404,
    *     "error": "Not Found",
    *     "message": "Task not found"    
    * }
    */
   async findOne(id: string) {
      try {
         const task = await this.prisma.task.findUnique({
            where: {
               id: id
            }
         });

         // TODO: cuando sea un servicio real, se debe retornar un throw RpcException
         if(!task) return new RpcException({ message: 'Task not found', status: HttpStatus.NOT_FOUND });

         return { status: 'success', task };

      } catch (error) {
         console.log('log3');
         console.log(error);
         handleRpcError(error);
      }
   }

   async update(id: string, updateTaskDto: UpdateTaskDto) {
      try {
         const task = await this.prisma.task.findUnique({
            where: {
               id: id
            }
         });

         // TODO: cuando sea un servicio real, se debe retornar un throw RpcException
         if(!task) return new RpcException({ message: 'Task not found', status: HttpStatus.NOT_FOUND });

         const taskUpdated = await this.prisma.task.update({
            where: {
               id: id
            },
            data: updateTaskDto
         });

         return { status: 'success', task: taskUpdated, message: 'Task updated successfully' };

      } catch (error) {
         handleRpcError(error);
      }
      return `This action updates a #${id} task`;
   }

   /**
    * 
    * @param id 
    * @returns 
    * 
    * @example
    * {
    *     "status": "success",
    *     "message": "The task #1234567890abcdef12345678 has been deleted"
    * }
    * @example
    * {
    *     "statusCode": 404,
    *     "error": "Not Found",
    *     "message": "Task not found"
    * }
    */
   async remove(id: string) {
      try {
         // Check if the task exists
         const task = await this.prisma.task.findUnique({
            where: {
               id: id
            }
         });

         // TODO: cuando sea un servicio real, se debe retornar un throw RpcException
         if(!task) return new RpcException({ message: 'Task not found', status: HttpStatus.NOT_FOUND });

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
}
