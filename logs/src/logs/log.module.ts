import { Module } from '@nestjs/common';
import { LogService } from './log.service';
import { LogController } from './log.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Log, LogSchema } from './schemas/logs.schema';

@Module({
   controllers: [LogController],
   providers: [LogService],
   imports: [
      MongooseModule.forFeature([{ name: Log.name, schema: LogSchema }]),  
   ]
})
export class LogModule {}
