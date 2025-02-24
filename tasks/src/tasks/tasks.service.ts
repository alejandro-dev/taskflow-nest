import { Injectable } from '@nestjs/common';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { PrismaService } from 'prisma/prisma.service';


@Injectable()
export class TasksService {
   constructor(private prisma: PrismaService) {}

   async create(createTaskDto: CreateTaskDto) {
      // return 'This action adds a new task';
      return await this.prisma.task.create({
         data: {
           title: createTaskDto.title,
           description: createTaskDto.description || null,
           assignedTo: createTaskDto.assignedTo
         },
       });
   } 

   async findAll() {
      const tasks = await this.prisma.task.findMany();
      return { status: 'success', tasks };
   }

   async findOne(id: number) {
      const tasks = await this.prisma.task.findMany();
      return { status: 'success', tasks }
   }

   update(id: number, updateTaskDto: UpdateTaskDto) {
      return `This action updates a #${id} task`;
   }

   remove(id: number) {
      return `This action removes a #${id} task`;
   }
}
