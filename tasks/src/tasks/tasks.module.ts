import { Module } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { TasksController } from './tasks.controller';
import { PrismaService } from 'prisma/prisma.service';
import { RedisModule } from 'src/redis/redis.module';

@Module({
   controllers: [TasksController],
   providers: [TasksService, PrismaService],
   imports: [RedisModule],
})
export class TasksModule {}
