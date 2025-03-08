import { Injectable } from '@nestjs/common';
import { Log } from './schemas/logs.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class LogService {
	constructor(@InjectModel(Log.name) private readonly logModel: Model<Log>) {}

	/**
    * 
    * @param {Object} logData - The log data
    * @param {string} logData.level - The log level (INFO, ERROR, WARN)
    * @param {string} logData.message - The log message
    * @param {string} logData.request_id - The request id. Identifies the request
    * @param {string} logData.user_id - The user id
    * @param {string} logData.event_type - The event type
    * @param {string} logData.service_name - The service name
    * @param {any} logData.details - The details of the log 
    * @description Create a log
    * 
    */
	async createLog(logData: { level: string, message: string, request_id: string, user_id: string, event_type: string, details: any }): Promise<any> {
		const log = new this.logModel(logData);
		return await log.save();
	}
}
