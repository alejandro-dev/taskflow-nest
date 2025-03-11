import { Controller, Get, Post, Body, Patch, Param, Delete, Inject, Put, UseGuards, Request } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { Services } from 'src/enums/services.enum';
import { catchError, firstValueFrom, Observable } from 'rxjs';
import { AuthGuard } from 'src/guards/auth.guard';
import { ChangeStatusDto } from './dto/change-status.dto';
import { AssignUserDto } from './dto/assign-user.dto';
import { RolesGuard } from 'src/guards/roles.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { RolesEnum } from 'src/enums/roles.enum';
import { TaskAccessGuard } from 'src/guards/task-access.guard';
import { CreateTaskRequestDto } from './dto/create-task-request.dto';
import { LoggerService } from 'src/logs/logs.service';
import { UpdateTaskRequestDto } from './dto/update-task-request.dto';
import { ChangeStatusRequestDto } from './dto/change-status-request.dto';
import { AssignUserRequestDto } from './dto/assign-user-request.dto';
import { UUID } from 'crypto';
import { UserExistGuard } from 'src/guards/user-exist.guard';

@Controller('tasks')
export class TasksController {
   constructor(@Inject(Services.TASKS_SERVICE) private readonly tasksService: ClientProxy, private readonly loggerService: LoggerService) {}
   
   /**
    * 
    * @route GET /tasks/healt
    * @description Healthcheck endpoint to check if the service is up and running
    * 
    * @response 200 {string} status - "success"
    * @response 400 {string} message - "Bad Request"
    * @response 401 {string} message - "Unauthorized"
    * @response 500 {string} message - "Internal Server Error"
    * 
    * @messagePattern tasks.healt
    * @example
    * {
    *     "status": "success"
    * }
    */
   @Get('healt')
   @UseGuards(AuthGuard)
   healt(): Observable<any> {
      try {
         return this.tasksService.send({ cmd: "healt_tasks" }, {})

      } catch (error) {
         throw error;
      }
   }

   /**
    * @route POST /tasks
    * @description Create a new task
    * @returns {Promise<Object>} The response contain the operation status and the created task
    * 
    * @param {any} req The request object
    * @param {Object} createTaskDto Object with the task data
    * @param {string} createTaskDto.title The title of the task
    * @param {string} createTaskDto.description The description of the task
    * @param {string} createTaskDto.assignedTo The id of the user assigned to the task
    * @param {string} createTaskDto.dueDate The due date of the task
    * @param {string} createTaskDto.status The status of the task. It can be 'pending', 'in_progress' or 'done'
    *   
    * @response 200 {object} task - The created task
    * @response 400 {string} message - "Bad Request"
    * @response 401 {string} message - "Unauthorized"
    * @response 500 {string} message - "Internal Server Error"
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
    * // Unauthorized response
    * statusCode: 401
    * {
    *    "statusCode": 401,
    *    "error": "Unauthorized",
    *    "message": "Token expired"
    * }
    * 
    */
   @UseGuards(AuthGuard, RolesGuard)
   @Roles(RolesEnum.ADMIN, RolesEnum.MANAGER)
   @Post()
   async create(@Request() req: any, @Body() createTaskDto: CreateTaskDto): Promise<any> {
      // Generate a request id to log the request
      const requestId = uuidv4();

      // Assign the author to the task
      createTaskDto.authorId = req.user.id;

      // Send de logs to logs microservice
      await this.loggerService.logInfo(requestId, 'api-getawey', req.user.id, 'tasks.create', 'Create task request received', { ...createTaskDto });

      // Create payload to create task
      const createTaskRequestDto: CreateTaskRequestDto = { createTaskDto, requestId };
      
      // We convert the Observable to a Promise and catch the errors
      return await firstValueFrom(
         this.tasksService.send({ cmd: 'tasks.create' }, createTaskRequestDto).pipe(
            catchError((error) => {
               throw new RpcException(error.message || 'Error creating task');
            })
         )
      );
   }

   /**
    * 
    * @route GET /tasks
    * @param {any} req  The request object
    * @description Get all tasks
    * @returns {Promise<Object>} The response contain the operation status and the tasks
    * 
    * @response 200 {object} tasks - The tasks
    * @response 401 {string} message - "Unauthorized"
    * @response 500 {string} message - "Internal Server Error"
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
    * // Unauthorized response
    * statusCode: 401
    * {
    *    "statusCode": 401,
    *    "error": "Unauthorized",
    *    "message": "Token expired"
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
   @UseGuards(AuthGuard, RolesGuard)
   @Roles(RolesEnum.ADMIN)
   @Get()
   async findAll(@Request() req: any): Promise<Object> {
      // Generate a request id to log the request
      const requestId = uuidv4();
      const userId = req.user.id;

      // Send de logs to logs microservice
      await this.loggerService.logInfo(requestId, 'api-getawey', userId, 'tasks.findAll', 'Find all task request received');

      // We convert the Observable to a Promise and catch the errors
      return await firstValueFrom(
         this.tasksService.send({ cmd: 'tasks.findAll' }, { requestId, userId }).pipe(
            catchError((error) => {
               throw new RpcException(error.message || 'Error getting tasks');
            })
         )
      );
   }

   /**
    *
    * @route GET /tasks/:id
    * @description Get a task by id
    * @param {any} req - The request object
    * @param {string} id - The id of the task
    * @returns {Promise<Object>} The response contain the operation status and the task
    * 
    * @response 200 {object} task - The task    
    * @response 401 {string} message - "Unauthorized"
    * @response 404 {string} message - "Not Found"
    * @response 500 {string} message - "Internal Server Error"
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
    * // Unauthorized response
    * statusCode: 401
    * {
    *    "statusCode": 401,
    *    "error": "Unauthorized",
    *    "message": "Token expired"
    * }
    * 
    * @example
    * // Not Found response
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
   @UseGuards(AuthGuard, TaskAccessGuard)
   @Get(':id')
   async findOne(@Request() req: any, @Param('id') id: string): Promise<Object> {
      // Generate a request id to log the request
      const requestId = uuidv4();
      const userId = req.user.id;

      // Send de logs to logs microservice
      await this.loggerService.logInfo(requestId, 'api-getawey', userId, 'tasks.findOne', 'Find one task request received', { taskId: id });

      // We convert the Observable to a Promise and catch the errors
      return await firstValueFrom(
         this.tasksService.send({ cmd: 'tasks.findOne' }, { id, requestId, userId }).pipe(
            catchError((error) => {
               throw new RpcException(error.message || 'Error getting task');
            })
         )
      );
   }

   /**
    * 
    * @route GET /author/:authorId
    * @description Get a task by author id
    * @param {any} req  The request object
    * @param {string} authorId - Author id
    * @returns {Promise<Object>} - Task
    * 
    * @useGuards AuthGuard, RolesGuard
    * @roles ADMIN, MANAGER
    * 
    * @example
    * // Success
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
    * // Unauthorized response
    * statusCode: 401
    * {
    *    "statusCode": 401,
    *    "error": "Unauthorized",
    *    "message": "Token expired"
    * }
    * 
    * @example
    * // Forbidden
    * statusCode: 403
    * {
    *    "status": "fail",
    *    "message": "You don't have permission to access this task"
    * }
    * 
    * @example
    * // Not Found response
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
   @UseGuards(AuthGuard, RolesGuard, TaskAccessGuard, UserExistGuard)
   @Roles(RolesEnum.ADMIN, RolesEnum.MANAGER)
   @Get('author/:id')
   async findByAuthorId(@Request() req: any, @Param('id') authorId: string): Promise<Object> {
      // Generate a request id to log the request
      const requestId = uuidv4();
      const userId = req.user.id;

      // Send de logs to logs microservice
      await this.loggerService.logInfo(requestId, 'api-getawey', userId, 'tasks.findByAuthorId', 'Find author tasks request received', { authorId });

      // We convert the Observable to a Promise and catch the errors
      return await firstValueFrom(
         this.tasksService.send({ cmd: 'tasks.findByAuthorId' }, { authorId, requestId, userId }).pipe(
            catchError((error) => {
               throw new RpcException(error.message || 'Error getting task');
            })
         )
      );
   }

   /**
    * 
    * @route GET /author/:authorId
    * @description Get a task by author id
    * @param {any} The request object
    * @param {string} assignedId - Author id
    * @returns {Promise<Object>} - Task
    * 
    * @useGuards AuthGuard, RolesGuard, UserTasksGuard
    * 
    * @example
    * // Success
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
    * // Unauthorized response
    * statusCode: 401
    * {
    *    "statusCode": 401,
    *    "error": "Unauthorized",
    *    "message": "Token expired"
    * }
    * 
    * @example
    * // Forbidden
    * statusCode: 403
    * {
    *    "status": "fail",
    *    "message": "You don't have permission to access this task"
    * }
    * 
    * @example
    * // Not Found response
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
   @UseGuards(AuthGuard, RolesGuard, TaskAccessGuard, UserExistGuard)
   @Get('assigned/:id')
   async findByAssignedId(@Request() req: any, @Param('id') assignedId: string): Promise<Object> {
      // Generate a request id to log the request
      const requestId = uuidv4();
      const userId = req.user.id;

      // Send de logs to logs microservice
      await this.loggerService.logInfo(requestId, 'api-getawey', userId, 'tasks.findByAssignedId', 'Find user assigned tasks request received', { assignedId });

      // We convert the Observable to a Promise and catch the errors
      return await firstValueFrom(
         this.tasksService.send({ cmd: 'tasks.findByAssignedId' }, { assignedId, requestId, userId }).pipe(
            catchError((error) => {
               throw new RpcException(error.message || 'Error getting task');
            })
         )
      );
   }

   /**
    *
    * @route PUT /tasks/:id
    * 
    * @param {any} req - The request object
    * @param {string} id - The id of the task
    * @param {Object} updateTaskDto The task data to update
    * @param {string} updateTaskDto.title The title of the task
    * @param {string} updateTaskDto.description The description of the task
    * @param {string} updateTaskDto.assignedTo The id of the user assigned to the task
    * @param {string} updateTaskDto.dueDate The due date of the task
    * @param {string} updateTaskDto.status The status of the task. It can be 'pending', 'in_progress' or 'done'
    * @returns {Promise<Object>} The response contain the operation status and the updated task
    * 
    * @response 200 {object} task - The updated task
    * @response 400 {string} message - "Bad Request"
    * @response 401 {string} message - "Unauthorized"
    * @response 404 {string} message - "Not Found"
    * @response 500 {string} message - "Internal Server Error"
    *
    * @example
    * // Example success response
    * statusCode: 200
    * {
    *    "status": "success",
    *    "message": "Task updated successfully",
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
    * // Bad Request response
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
    * // Unauthorized response 
    * statusCode: 401
    * {
    *    "statusCode": 401,
    *    "error": "Unauthorized",
    *    "message": "Unauthorized"
    * }
    * 
    * @example
    * // Not Found response
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
   @UseGuards(AuthGuard, TaskAccessGuard)
   @Put(':id')
   async update(@Request() req: any, @Param('id') id: string, @Body() updateTaskDto: UpdateTaskDto): Promise<Object> {
      // Generate a request id to log the request
      const requestId = uuidv4();
      const userId = req.user.id;

      // Send de logs to logs microservice
      await this.loggerService.logInfo(requestId, 'api-getawey', userId, 'tasks.update', 'Update task request received', { id, updateTaskDto });

      // Create the payload to update the task
      const userUpdated = { ...updateTaskDto, id };
      const payload: UpdateTaskRequestDto = { updateTaskDto: userUpdated, requestId, userId };

      // We convert the Observable to a Promise and catch the errors
      return await firstValueFrom(
         this.tasksService.send({ cmd: 'tasks.update' }, payload).pipe(
            catchError((error) => {
               throw new RpcException(error.message || 'Error getting task');
            })
         )
      );
   }

   /**
    * @route DELETE /tasks/:id
    * @description Delete a task by id
    * 
    * @param {any} req - The request object
    * @param {string} id - The ID of the task
    * @returns {Promise<Object>} The response containing the operation status and message
    * 
    * @response 200 {Object} Success - The task was deleted
    * @response 401 {Object} Unauthorized - User is not authorized
    * @response 404 {Object} Not Found - Task not found
    * @response 500 {Object} Server Error - Internal server error
    * 
    * @example
    * // Example success response
    * {
    *   "status": "success",
    *   "message": "The task #1234567890abcdef12345678 has been deleted"
    * }
    * 
    * @example 
    * // Unauthorized response   
    * {
    *   "statusCode": 401,
    *   "message": "Unauthorized"
    * }
    * 
    * @example 
    * // Not Found response   
    * {
    *   "status": "fail",
    *   "message": "Task not found"
    * }
    * 
    * @example
    * // Internal Server Error response
    * {
    *   "status": "error",
    *   "message": "Internal Server Error"
    * }
    */
   @UseGuards(AuthGuard, RolesGuard, TaskAccessGuard)
   @Roles(RolesEnum.ADMIN, RolesEnum.MANAGER)
   @Delete(':id')
   async remove(@Request() req: any, @Param('id') id: string): Promise<Object> {
      // Generate a request id to log the request
      const requestId = uuidv4();
      const userId = req.user.id;

      // Send de logs to logs microservice
      await this.loggerService.logInfo(requestId, 'api-getawey', userId, 'tasks.delete', 'Delete task request received', { id });

      // We convert the Observable to a Promise and catch the errors
      return await firstValueFrom(
         this.tasksService.send({ cmd: 'tasks.delete' }, { id, requestId, userId }).pipe(
            catchError((error) => {
               throw new RpcException(error.message || 'Error deleting task');
            })
         )
      );
   }

   /**
    * 
    * @route PATCH /tasks/:id/change-status
    * @returns {Promise<Object>} The response contain the operation status and the updated task
    * @param {any} req - The request object
    * @param {string} id - The id of the task
    * @param {ChangeStatusDto} changeStatusDto - The task data to change the status of a task
    * @param {string} changeStatusDto.status - The status of the task. It can be 'pending', 'in_progress' or 'done'
    * 
    * @response 200 {object} task - The updated task
    * @response 400 {string} message - "Bad Request"
    * @response 401 {string} message - "Unauthorized"
    * @response 404 {string} message - "Not Found"
    * @response 500 {string} message - "Internal Server Error"
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
    *    }
    * }
    * 
    * @example
    * // Bad Request response
    * statusCode: 400 
    * {
    *    "status": "fail",
    *    "message": "Your request is invalid"
    * }  
    * 
    * @example
    * // Unauthorized response
    * statusCode: 401
    * {
    *    "status": "fail",
    *    "message": "Unauthorized",
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
   @UseGuards(AuthGuard, TaskAccessGuard)
   @Patch(':id/change-status')
   async changeStatus(@Request() req: any, @Param('id') id: string, @Body() changeStatusDto: ChangeStatusDto): Promise<Object> {
      // Generate a request id to log the request
      const requestId = uuidv4();
      const userId = req.user.id;

      // Create the task state to update
      const taskStateUpdated = { id, status: changeStatusDto.status };

      // Create the payload to update the task
      const payload: ChangeStatusRequestDto = { changeStatusDto: taskStateUpdated, requestId, userId };

      // Send de logs to logs microservice
      await this.loggerService.logInfo(requestId, 'api-getawey', userId, 'tasks.change-status', 'Change task status request received', { id, taskStateUpdated });

      // We convert the Observable to a Promise and catch the errors
      return await firstValueFrom(
         this.tasksService.send({ cmd: 'tasks.change-status' }, payload).pipe(
            catchError((error) => {
               throw new RpcException(error.message || 'Error deleting task');
            })
         )
      );
   }

   /**
    * 
    * @route PATCH /tasks/:id/assign-user
    * @param {any} req - The request object
    * @param {string} id - The id of the task
    * @param {AssignUserDto} assignUserDto - The task data to assign the author of a task
    * @param {string} assignAuthorDto.assignedTo - The id of the user assigned to the task
    * 
    * @returns {Promise<Object>} The response contain the operation status and the updated task
    * 
    * @response 200 {object} task - The updated task
    * @response 400 {string} message - "Bad Request"
    * @response 401 {string} message - "Unauthorized"
    * @response 404 {string} message - "Not Found"
    * @response 500 {string} message - "Internal Server Error"
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
    * // Bad Request response
    * statusCode: 400 
    * {
    *    "status": "fail",
    *    "message": "Your request is invalid"
    * }  
    * 
    * @example       
    * // Unauthorized response
    * statusCode: 401
    * {
    *    "statusCode": 401,
    *    "message": "Unauthorized",
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
   @UseGuards(AuthGuard, RolesGuard, TaskAccessGuard)
   @Roles(RolesEnum.ADMIN, RolesEnum.MANAGER)
   @Patch(':id/assign-user')
   async assignAuthor(@Request() req: any, @Param('id') id: UUID, @Body() assignUserDto: AssignUserDto): Promise<Object> {
      // Generate a request id to log the request
      const requestId = uuidv4();
      const userId = req.user.id;

      // Send de logs to logs microservice
      await this.loggerService.logInfo(requestId, 'api-getawey', userId, 'tasks.assign-user', 'Assign user request received', { id, ...assignUserDto });

      // Create the payload to update the task
      const payload: AssignUserRequestDto = { assignUserDto, id, requestId, userId };

      // We convert the Observable to a Promise and catch the errors
      return await firstValueFrom(
         this.tasksService.send({ cmd: 'tasks.assign-user' }, payload).pipe(
            catchError((error) => {
               throw new RpcException(error.message || 'Error author updated task');
            })
         )
      );
   }
}
