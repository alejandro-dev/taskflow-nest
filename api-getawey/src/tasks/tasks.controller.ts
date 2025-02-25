import { Controller, Get, Post, Body, Patch, Param, Delete, Inject, InternalServerErrorException, Put } from '@nestjs/common';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { ClientProxy } from '@nestjs/microservices';
import { Services } from 'src/enums/services.enum';
import { catchError, firstValueFrom, Observable } from 'rxjs';

@Controller('tasks')
export class TasksController {
   constructor(@Inject(Services.TASKS_SERVICE) private readonly tasksService: ClientProxy) {}

   @Get('healt')
   healt(): Observable<any> {
      return this.tasksService.send({ cmd: "healt_tasks" },  {})
   }

  @Post()
  async create(@Body() createTaskDto: CreateTaskDto): Promise<any> {
      try {
         // We convert the Observable to a Promise and catch the errors
         return await firstValueFrom(
            this.tasksService.send({ cmd: 'tasks.create' }, { ...createTaskDto }).pipe(
               catchError((error) => {
                  console.log(error);
                  throw new InternalServerErrorException(error.message || 'Error creating task');
               })
            )
         );

      } catch (error) {
         throw error;
      }
  }

   @Get()
   async findAll() {
      try {
         // We convert the Observable to a Promise and catch the errors
         return await firstValueFrom(
            this.tasksService.send({ cmd: 'tasks.findAll' }, {}).pipe(
               catchError((error) => {
                  console.log(error);
                  throw new InternalServerErrorException(error.message || 'Error getting tasks');
               })
            )
         );

      } catch (error) {
         throw error;
      }
   }

   @Get(':id')
   async findOne(@Param('id') id: string) {
      try {
         // We convert the Observable to a Promise and catch the errors
         return await firstValueFrom(
            this.tasksService.send({ cmd: 'tasks.findOne' }, { id }).pipe(
               catchError((error) => {
                  console.log(error);
                  throw new InternalServerErrorException(error.message || 'Error getting task');
               })
            )
         );

      } catch (error) {
         throw error;
      }
   }

   @Put(':id')
   async update(@Param('id') id: string, @Body() updateTaskDto: UpdateTaskDto) {
      try {
         const userUpdated = { ...updateTaskDto, id };
         // We convert the Observable to a Promise and catch the errors
         return await firstValueFrom(
            this.tasksService.send({ cmd: 'tasks.update' }, { ...userUpdated }).pipe(
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

   @Delete(':id')
   async remove(@Param('id') id: string) {
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
}
