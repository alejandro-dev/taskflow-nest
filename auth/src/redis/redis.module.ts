import { Module, Global } from '@nestjs/common';
import Redis from 'ioredis';
import { envs } from 'src/config/envs';

@Global() // Hace que esté disponible en toda la app
@Module({
   providers: [
      {
         provide: 'REDIS_CLIENT',
         useFactory: () => {
         return new Redis({
            host: envs.REDIS_HOST,
            port: envs.REDIS_PORT,
         });
         },
      },
   ],
   exports: ['REDIS_CLIENT'], // Lo exportamos para usarlo en otros módulos
})
export class RedisModule {}
