import { Injectable } from '@nestjs/common';
import { Log } from './schemas/logs.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class LogService {
	constructor(@InjectModel(Log.name) private readonly logModel: Model<Log>) {}

	// Este método se ejecuta cuando recibe un mensaje de la cola "logs_queue"
	async handleTaskLogs(logData: { level: string, message: string, request_id: string, user_id: string, event_type: string, details: any }): Promise<any> {
	  	console.log('Log received:', logData.message);
		const log = new this.logModel(logData);
		return await log.save();
	}
}
