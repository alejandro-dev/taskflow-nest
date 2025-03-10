import { Controller } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { UpdateTaskDto } from './dto/update-task.dto';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { ChangeStatusDto } from './dto/change-status.dto';
import { AssignUserDto } from './dto/assign-user.dto';
import { TasksCacheService } from './tasks-cache.service';
import { CreateTaskRequestDto } from './dto/create-task-request.dto';
import { UpdateTaskRequestDto } from './dto/update-task-request.dto';
import { ChangeStatusRequestDto } from './dto/change-status-request.dto';
import { AssignUserRequestDto } from './dto/assign-user-request.dto';

@Controller('tasks')
export class TasksController {
   constructor(private readonly tasksService: TasksService, private readonly tasksCacheService: TasksCacheService) {}

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
    * @description Create a new task+
    * @param {Object} createTaskRequestDto - The task data to create a new task with the request id
    * @param {string} createTaskRequestDto.requestId - The request id
    * @param {Object} createTaskRequestDto.createTaskDto - The task data to create a new task 
    * @param {string} createTaskRequestDto.createTaskDto.title - The title of the task
    * @param {string} createTaskRequestDto.createTaskDto.description - The description of the task
    * @param {string} createTaskRequestDto.createTaskDto.assignedTo - The id of the user assigned to the task
    * @param {string} createTaskRequestDto.createTaskDto.dueDate - The due date of the task
    * @param {string} createTaskRequestDto.createTaskDto.status - The status of the task
    * @param {string} createTaskRequestDto.createTaskDto.priority - The priority of the task
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
   create(@Payload() createTaskRequestDto: CreateTaskRequestDto): Object{
      try {
         // Get createTaskDto, requestId and userId from the payload
         const { createTaskDto, requestId } = createTaskRequestDto;

         return  this.tasksService.create(createTaskDto, requestId);

      } catch (error) {
         return error;
      }
   }

   /**
    * 
    * @returns {Object} The response contain the operation status and the list of tasks
    * @param {Object} payloadBody - The request id and user id
    * @param {string} payloadBody.requestId - The request id
    * @param {string} payloadBody.userId - The user id
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
   findAll(@Payload() payloadBody: { [key: string]: string }): Object {
      try {
         // Get requestId and userId from the payload
         const { requestId, userId } = payloadBody;
         
         // Check all tasks in Redis, if not found, query the DB
         return this.tasksCacheService.findAllRedis(requestId, userId);

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
    * @param {Object} payloadBody - The task id, request id and user id
    * @param {string} payloadBody.id - The task id
    * @param {string} payloadBody.requestId - The request id
    * @param {string} payloadBody.userId - The user id
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
   findOne(@Payload() payloadBody: { [key: string]: string }): Object {
      try {
         // Get taskId, requestId and userId from the payload
         const { id, requestId, userId } = payloadBody;
         return this.tasksService.findOne(id, requestId, userId);

      } catch (error) {
         return error;
      }
   }

   /**
    * 
    * @returns {Object} The response contain the operation status and the task
    * 
    * @messagePattern tasks.findByAuthorId
    * @description Get a task by author id
    * @param {Object} payloadBody - The author id, request id and user id
    * @param {string} payloadBody.authorId - The author id
    * @param {string} payloadBody.requestId - The request id
    * @param {string} payloadBody.userId - The user id
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
   @MessagePattern({ cmd: 'tasks.findByAuthorId' })
   findByAuthorId(@Payload() payloadBody: { [key: string]: string }): Object {
      try {
         // Get authorId, requestId and userId from the payload
         const { authorId, requestId, userId } = payloadBody;

         // Check all tasks from author in Redis, if not found, query the DB
         return this.tasksCacheService.findByAuthorIdRedis(authorId, requestId, userId);

      } catch (error) {
         return error;
      }
   }

   /**
    * 
    * @returns {Object} The response contain the operation status and the task
    * 
    * @messagePattern tasks.findByAssignedId
    * @description Get a task by assigned id
    * @param {Object} payloadBody - The author id, request id and user id
    * @param {string} payloadBody.assignedId - The assigned id
    * @param {string} payloadBody.requestId - The request id
    * @param {string} payloadBody.userId - The user id
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
   @MessagePattern({ cmd: 'tasks.findByAssignedId' })
   findByAssignedId(@Payload() payloadBody: { [key: string]: string }): Object {
      try {
         // Get assignedId, requestId and userId from the payload
         const { assignedId, requestId, userId } = payloadBody;

         // Check all tasks from user assigned in Redis, if not found, query the DB
         return this.tasksCacheService.findByAssignedIdRedis(assignedId, requestId, userId);

      } catch (error) {
         return error;
      }
   }

   /**
    * 
    * @param {Object} updateTaskRequestDto - The task data to update a task, request id and user id
    * @param {string} updateTaskRequestDto.requestId - The request id
    * @param {string} updateTaskRequestDto.userId - The user id
    * @param {Object} updateTaskRequestDto.updateTaskDto - The task data to update a task
    * @param {string} updateTaskRequestDto.updateTaskDto.id - The id of the task
    * @param {string} updateTaskRequestDto.updateTaskDto.title - The title of the task
    * @param {string} updateTaskRequestDto.updateTaskDto.description - The description of the task
    * @param {string} updateTaskRequestDto.updateTaskDto.assignedTo - The id of the user assigned to the task
    * @param {string} updateTaskRequestDto.updateTaskDto.dueDate - The due date of the task
    * @param {string} updateTaskRequestDto.updateTaskDto.status - The status of the task
    * @param {string} updateTaskRequestDto.updateTaskDto.priority - The priority of the task
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
   update(@Payload() updateTaskRequestDto: UpdateTaskRequestDto): Object {
      try {
         // Get updateTaskDto, requestId and userId from the payload
         const { updateTaskDto, requestId, userId } = updateTaskRequestDto;

         return this.tasksService.update(updateTaskDto, requestId, userId);

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
   remove(@Payload() payloadBody: { [key: string]: string }): Object {
      try {
         // Get id, requestId and userId from the payload
         const { id, requestId, userId } = payloadBody;

         return this.tasksService.remove(id, requestId, userId);

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
   changeStatus(@Payload() changeStatusRequestDto: ChangeStatusRequestDto): Object {
      try {
         const { changeStatusDto, requestId, userId } = changeStatusRequestDto;
         return this.tasksService.changeStatus(changeStatusDto, requestId, userId);

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
   @MessagePattern({ cmd: 'tasks.assign-user' })
   assignAuthor(@Payload() assignUserRequestDto: AssignUserRequestDto): Object {
      try {
         const { assignUserDto, id, requestId, userId } = assignUserRequestDto;
         return this.tasksService.assignUser(assignUserDto, id, requestId, userId);

      } catch (error) {
         return error;
      }
   }
}
