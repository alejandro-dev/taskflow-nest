import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { envs } from './config/envs';
import { RpcExceptionFilter } from './tasks/filters/exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Apply the global filter to the app
  app.useGlobalFilters(new RpcExceptionFilter());

  await app.listen(envs.PORT);
}
bootstrap();
