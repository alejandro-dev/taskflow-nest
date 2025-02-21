import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    AuthModule,

    // Configuration .env file
    ConfigModule.forRoot({
      isGlobal: true,
    })
  ]
})

export class AppModule {}
