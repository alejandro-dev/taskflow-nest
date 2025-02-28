import { Controller, Get, Post, Body, Patch, Param, Delete, Inject, InternalServerErrorException, Put, UseGuards } from '@nestjs/common';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { Services } from 'src/enums/services.enum';
import { catchError, firstValueFrom, Observable } from 'rxjs';
import { AuthGuard } from 'src/guards/auth.guards';
import { ChangeStatusDto } from './dto/change-status.dto';
import { AssignAuthorDto } from './dto/assign-author.dto';

@Controller('tasks')
export class TasksController {
   constructor(@Inject(Services.TASKS_SERVICE) private readonly tasksService: ClientProxy) {}
   
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
   @UseGuards(AuthGuard)
   @Get('healt')
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
    * @param createTaskDto Object with the task data
    * @param createTaskDto.title {string} The title of the task
    * @param createTaskDto.description {string} The description of the task
    * @param createTaskDto.assignedTo {string} The id of the user assigned to the task
    * @param createTaskDto.dueDate {string} The due date of the task
    * @param createTaskDto.status {string} The status of the task. It can be 'pending', 'in_progress' or 'done'
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
   @UseGuards(AuthGuard)
   @Post()
   async create(@Body() createTaskDto: CreateTaskDto): Promise<any> {
      try {
         // We convert the Observable to a Promise and catch the errors
         return await firstValueFrom(
            this.tasksService.send({ cmd: 'tasks.create' }, { ...createTaskDto }).pipe(
               catchError((error) => {
                  throw new InternalServerErrorException(error.message || 'Error creating task');
               })
            )
         );

      } catch (error) {
         throw error;
      }
   }

   /**
    * 
    * @route GET /tasks
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
   @UseGuards(AuthGuard)
   @Get()
   async findAll(): Promise<Object> {
      try {
         // We convert the Observable to a Promise and catch the errors
         return await firstValueFrom(
            this.tasksService.send({ cmd: 'tasks.findAll' }, {}).pipe(
               catchError((error) => {
                  throw new InternalServerErrorException(error.message || 'Error getting tasks');
               })
            )
         );

      } catch (error) {
         throw error;
      }
   }

   /**
    *
    * @route GET /tasks/:id
    * @description Get a task by id
    * @param id {string} The id of the task
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
   @UseGuards(AuthGuard)
   @Get(':id')
   async findOne(@Param('id') id: string): Promise<Object> {
      try {
         // We convert the Observable to a Promise and catch the errors
         return await firstValueFrom(
            this.tasksService.send({ cmd: 'tasks.findOne' }, { id }).pipe(
               catchError((error) => {
                  throw new InternalServerErrorException(error.message || 'Error getting task');
               })
            )
         );

      } catch (error) {
         throw error;
      }
   }

   /**
    *
    * @route PUT /tasks/:id
    * 
    * @param id {string} The id of the task
    * @param updateTaskDto {object} The task data to update
    * @param updateTaskDto Object with the task data
    * @param updateTaskDto.title {string} The title of the task
    * @param updateTaskDto.description {string} The description of the task
    * @param updateTaskDto.assignedTo {string} The id of the user assigned to the task
    * @param updateTaskDto.dueDate {string} The due date of the task
    * @param updateTaskDto.status {string} The status of the task. It can be 'pending', 'in_progress' or 'done'
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
   @UseGuards(AuthGuard)
   @Put(':id')
   async update(@Param('id') id: string, @Body() updateTaskDto: UpdateTaskDto): Promise<Object> {
      try {
         const userUpdated = { ...updateTaskDto, id };
         // We convert the Observable to a Promise and catch the errors
         return await firstValueFrom(
            this.tasksService.send({ cmd: 'tasks.update' }, { ...userUpdated }).pipe(
               catchError((error) => {
                  throw new InternalServerErrorException(error.message || 'Error deleting task');
               })
            )
         );

      } catch (error) {
         throw error;
      }
   }

   /**
    * 
    * @route DELETE /tasks/:id
    * 
    * @description Delete a task by id
    * @param id {string} The id of the task
    * @returns {Promise<Object>} The response contain the operation status and the message
    * 
    * @response 200 {object} message - The message
    * @response 401 {string} message - "Unauthorized"
    * @response 404 {string} message - "Not Found"
    * @response 500 {string} message - "Internal Server Error"
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
    * // Unauthorized response   
    * statusCode: 401
    * {
    *    "statusCode": 401,
    *    "message": "Unauthorized",
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
   @UseGuards(AuthGuard)
   @Delete(':id')
   async remove(@Param('id') id: string): Promise<Object> {
      try {
         // We convert the Observable to a Promise and catch the errors
         return await firstValueFrom(
            this.tasksService.send({ cmd: 'tasks.delete' }, { id }).pipe(
               catchError((error) => {
                  console.log(error);
                  throw new InternalServerErrorException(error.message || 'Error deleting task');
               })
            )
         );

      } catch (error) {
         throw error;
      }
   }

   /**
    * 
    * @returns {Promise<Object>} The response contain the operation status and the updated task
    * @param id - The id of the task
    * @param changeStatusDto - The task data to change the status of a task
    * @param changeStatusDto.status - The status of the task. It can be 'pending', 'in_progress' or 'done'
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
   @UseGuards(AuthGuard)
   @Patch(':id/change-status')
   async changeStatus(@Param('id') id: string, @Body() changeStatusDto: ChangeStatusDto) {
      try {
         const taskStateUpdated = { id, status: changeStatusDto.status };

         // We convert the Observable to a Promise and catch the errors
         return await firstValueFrom(
            this.tasksService.send({ cmd: 'tasks.change-status' }, { ...taskStateUpdated }).pipe(
               catchError((error) => {
                  throw new InternalServerErrorException(error.message || 'Error deleting task');
               })
            )
         );

      } catch (error) {
         throw error;
      }
   }

   @UseGuards(AuthGuard)
   @Patch(':id/assign-author')
   async assignAuthor(@Param('id') id: string, @Body() assignAuthorDto: AssignAuthorDto) {
      try {
         const taskStateUpdated = { id, assignedTo: assignAuthorDto.assignedTo };

         // We convert the Observable to a Promise and catch the errors
         return await firstValueFrom(
            this.tasksService.send({ cmd: 'tasks.assign-author' }, { ...taskStateUpdated }).pipe(
               catchError((error) => {
                  throw new InternalServerErrorException(error.message || 'Error author updated task');
               })
            )
         );

      } catch (error) {
         throw error;
      }
   }
}
