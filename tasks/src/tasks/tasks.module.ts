import { Module } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { TasksController } from './tasks.controller';
import { PrismaService } from 'prisma/prisma.service';
import { RedisModule } from 'src/redis/redis.module';
import { TasksCacheService } from './tasks-cache.service';

@Module({
   controllers: [TasksController],
   providers: [TasksCacheService, TasksService, PrismaService],
   imports: [RedisModule],
})
export class TasksModule {}
