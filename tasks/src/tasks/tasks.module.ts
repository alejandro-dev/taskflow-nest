import { Module } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { TasksController } from './tasks.controller';
import { Task } from './entities/task.entity';
import { PrismaService } from 'prisma/prisma.service';

@Module({
   controllers: [TasksController],
   providers: [TasksService, PrismaService],
   imports: [],
})
export class TasksModule {}
