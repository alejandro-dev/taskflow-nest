import { Controller, Get, Post, Body, Param, Delete, Put } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { MessagePattern, Payload } from '@nestjs/microservices';

@Controller('tasks')
export class TasksController {
   constructor(private readonly tasksService: TasksService) {}

   @MessagePattern({ cmd: 'healt_tasks' })
   healt() {
      return { healt: true };
   }

   @MessagePattern({ cmd: 'tasks.create' })
   create(@Payload() createTaskDto: CreateTaskDto) {
      console.log('log5');
      return this.tasksService.create(createTaskDto);
   }

   @MessagePattern({ cmd: 'tasks.findAll' })
   findAll() {
      return this.tasksService.findAll();
   }

   @MessagePattern({ cmd: 'tasks.findOne' })
   findOne(@Payload('id') id: string) {
      try {
         return this.tasksService.findOne(id);

      } catch (error) {
         console.log('log4');
         return error;
      }
   }

   @MessagePattern({ cmd: 'tasks.update' })
   // update(@Payload('id') id: string, @Body() updateTaskDto: UpdateTaskDto) {
   update(@Payload() updateTaskDto: UpdateTaskDto) {
      return this.tasksService.update(updateTaskDto);
   }

   @MessagePattern({ cmd: 'tasks.delete' })
   remove(@Payload('id') id: string) {
      return this.tasksService.remove(id);
   }
}
