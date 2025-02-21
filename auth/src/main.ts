import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { QueuesEnum } from './enums/queues.enum';
import { envs } from './config/envs';
import { RpcExceptionFilter } from './filters/exception.filter';
import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { ValidationError } from 'class-validator';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    // Configure the microservice to connect to RMQ
    {
      transport: Transport.RMQ,
      options: {
        urls: [envs.RMQ_URL!],
        queue: QueuesEnum.AUTH_QUEUE,
        queueOptions: {
          durable: true,
        },
        noAck: true
      }   
    }
  );

  // Validation fields in the controllers
	app.useGlobalPipes(
		new ValidationPipe({
			whitelist: true,
			transform: true,
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

  await app.listen();
}
bootstrap();
