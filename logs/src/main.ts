import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { envs } from './config/envs';
import { QueuesEnum } from './enums/queues.enum';

async function bootstrap() {
	const app = await NestFactory.createMicroservice<MicroserviceOptions>(
		AppModule,
		// Configure the microservice to connect to RMQ
      {
         transport: Transport.RMQ,
         options: {
         urls: [envs.RMQ_URL!],
         queue: QueuesEnum.LOGS_QUEUE,
         queueOptions: {
            durable: true,
         },
         noAck: true
         }   
      }
   );
	await app.listen();
}
bootstrap();
