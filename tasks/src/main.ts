import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { envs } from './config/envs';
import { RpcExceptionFilter } from './tasks/filters/exception.filter';
import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { ValidationError } from 'class-validator';

async function bootstrap() {
   const app = await NestFactory.create(AppModule);

   app.useGlobalPipes(
      new ValidationPipe({
         whitelist: true,
         transform: true,
         forbidNonWhitelisted: true,
         forbidUnknownValues: true,
         // Customize the error response
         exceptionFactory: (errors: ValidationError[]) => {
            const formattedErrors = errors.map(error => ({
               field: error.property,
               message: Object.values(error.constraints!).join(', '),
            }));
      
            return new BadRequestException({
               status: 'fail',
               message: "Your request is invalid",
               details: formattedErrors,
            });
         },
      }),
   );

   // Apply the global filter to the app
   app.useGlobalFilters(new RpcExceptionFilter());

   await app.listen(envs.PORT);
}
bootstrap();
