import "dotenv/config";
import * as joi from "joi";

/**
 * 
 * @param joi 
 * @returns 
 * @description Validate the environment variables
 */
const envSchema = joi.object({
    REDIS_HOST: joi.string().required(),
    REDIS_PORT: joi.number().required(),
    RMQ_URL: joi.string().required(),
    MAIL_HOST: joi.string().required(),
    MAIL_PORT: joi.number().required(),
    MAIL_USER: joi.string().required(),
    MAIL_PASSWORD: joi.string().required(),
}).unknown(true);

const { error, value } = envSchema.validate(process.env);
if(error) throw Error('Config validation error: ' + error.message);

// Get the environment variables
interface Env {
    REDIS_HOST: string;
    REDIS_PORT: number;
    RMQ_URL: string;
    MAIL_HOST: string;
    MAIL_PORT: number;
    MAIL_USER: string;
    MAIL_PASSWORD: string;
}
const envVars: Env = value;

// Export the environment variables
export const envs = {
    REDIS_HOST: envVars.REDIS_HOST as string,
    REDIS_PORT: envVars.REDIS_PORT as number,
    RMQ_URL: envVars.RMQ_URL as string,
    MAIL_HOST: envVars.MAIL_HOST as string,
    MAIL_PORT: envVars.MAIL_PORT as number,
    MAIL_USER: envVars.MAIL_USER as string,
    MAIL_PASSWORD: envVars.MAIL_PASSWORD as string,
};