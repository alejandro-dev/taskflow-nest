import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { RpcExceptionInterceptor } from './filters/exception.filter';
import { ValidationError } from 'class-validator';

async function bootstrap() {
    // Create the app
	const app = await NestFactory.create(AppModule);

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
	app.useGlobalInterceptors(new RpcExceptionInterceptor());

    // Listen the port
	await app.listen(process.env.PORT ?? 3000);
}
bootstrap();


