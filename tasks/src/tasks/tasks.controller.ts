import { Controller, Get, Post, Body, Param, Delete, Put } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { ChangeStatusDto } from './dto/change-status.dto';
import { AssignAuthorDto } from './dto/assign-author.dto';

@Controller('tasks')
export class TasksController {
   constructor(private readonly tasksService: TasksService) {}

   onModuleInit() {
      console.log('🟢  Microservicio TaskService iniciado y escuchando eventos');
   }

   /**
    * 
    * @returns {{ healt: boolean }} The health status of the service
    * @messagePattern tasks.healt
    * @description Healthcheck endpoint to check if the service is up and running
    *
    */
   @MessagePattern({ cmd: 'healt_tasks' })
   healt(): { healt: boolean } {
      try {
         return { healt: true };
         
      } catch (error) {
         return error;
      }
   }

   /**
    * 
    * @messagePattern tasks.create
    * @description Create a new task
    * @param createTaskDto - The task data to create a new task 
    * @param createTaskDto.title - The title of the task
    * @param createTaskDto.description - The description of the task
    * @param createTaskDto.assignedTo - The id of the user assigned to the task
    * @param createTaskDto.dueDate - The due date of the task
    * @param createTaskDto.status - The status of the task
    * @param createTaskDto.priority - The priority of the task
    * 
    * @returns {Object} The response contain the operation status and the created task
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
   @MessagePattern({ cmd: 'tasks.create' })
   create(@Payload() createTaskDto: CreateTaskDto): Object{
      try {
         return  this.tasksService.create(createTaskDto);

      } catch (error) {
         return error;
      }
   }

   /**
    * 
    * @returns {Object} The response contain the operation status and the list of tasks
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
   @MessagePattern({ cmd: 'tasks.findAll' })
   findAll(): Object {
      try {
         return this.tasksService.findAll();

      } catch (error) {
         return error;
      }
   }

   /**
    * 
    * @returns {Object} The response contain the operation status and the task
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
   @MessagePattern({ cmd: 'tasks.findOne' })
   findOne(@Payload('id') id: string): Object {
      try {
         return this.tasksService.findOne(id);

      } catch (error) {
         return error;
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
    * @returns {Object} The response contain the operation status and the updated task
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
   @MessagePattern({ cmd: 'tasks.update' })
   update(@Payload() updateTaskDto: UpdateTaskDto): Object {
      try {
         return this.tasksService.update(updateTaskDto);

      } catch (error) {
         return error;
      }
   }

   /**
    * 
    * @returns {Object} The response contain the operation status and the message
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
   @MessagePattern({ cmd: 'tasks.delete' })
   remove(@Payload('id') id: string): Object {
      try {
         return this.tasksService.remove(id);

      } catch (error) {
         return error;
      }
   }

   /**
    * 
    * @returns {Object} The response contain the operation status and the updated task
    * 
    * @messagePattern tasks.change-status
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
   @MessagePattern({ cmd: 'tasks.change-status' })
   changeStatus(@Payload() changeStatusDto: ChangeStatusDto): Object {
      try {
         return this.tasksService.changeStatus(changeStatusDto);

      } catch (error) {
         return error;
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
   @MessagePattern({ cmd: 'tasks.assign-author' })
   assignAuthor(@Payload() assignAuthorDto: AssignAuthorDto): Object {
      try {
         return this.tasksService.assignAuthor(assignAuthorDto);

      } catch (error) {
         return error;
      }
   }
}
