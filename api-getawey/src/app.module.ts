import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { TasksModule } from './tasks/tasks.module';

@Module({
  imports: [
    AuthModule,

    // Configuration .env file
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    TasksModule
  ]
})

export class AppModule {}
