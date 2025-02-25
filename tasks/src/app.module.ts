import { Module } from '@nestjs/common';
import { TasksModule } from './tasks/tasks.module';
import { ConfigModule } from '@nestjs/config';

@Module({
   imports: [
      TasksModule,
      // Configuration .env file
      ConfigModule.forRoot({
         isGlobal: true,
      }),
   ],
   controllers: [],
   providers: [],
})

export class AppModule {}
