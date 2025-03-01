import { Injectable } from '@nestjs/common';
import Redis from 'ioredis';
import { envs } from 'src/config/envs';

@Injectable()
export class RedisService {
   private redis: Redis;

   constructor() {
      this.redis = new Redis({
         host: envs.REDIS_HOST,
         port: envs.REDIS_PORT,
      });
   }

   // Suscribe to the events from Redis
   subscribeToEvents(events: Record<string, Function>) {
      Object.keys(events).forEach((channel) => {
         this.redis.subscribe(channel);

         this.redis.on('message', async (subscribedChannel, message) => {
         if (subscribedChannel === channel) {
            await events[channel](message);
         }
         });
      });
   }
}
