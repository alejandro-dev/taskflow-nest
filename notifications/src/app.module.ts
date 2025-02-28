import { Module } from '@nestjs/common';
import { NotificationsModule } from './notifications/notifications.module';
import { ConfigModule } from '@nestjs/config';

@Module({
   imports: [
      NotificationsModule,
      // Configuration .env file
      ConfigModule.forRoot({
         isGlobal: true,
      }),
   ],
   controllers: [],
   providers: [],
})
export class AppModule {}
