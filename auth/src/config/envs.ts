import "dotenv/config";
import * as joi from "joi";

/**
 * 
 * @param joi 
 * @returns 
 * @description Validate the environment variables
 */
const envSchema = joi.object({
    DATABASE_URL: joi.string().required(),
    RMQ_URL: joi.string().required(),
    REDIS_HOST: joi.string().required(),
    REDIS_PORT: joi.number().required(),
    JWT_SECRET: joi.string().required(),
}).unknown(true);

const { error, value } = envSchema.validate(process.env);
if(error) throw Error('Config validation error: ' + error.message);

// Get the environment variables
interface Env {
    DATABASE_URL: string;
    RMQ_URL: string;
    REDIS_HOST: string;
    REDIS_PORT: number;
    JWT_SECRET: string;
}
const envVars: Env = value;

// Export the environment variables
export const envs = {
    DATABASE_URL: envVars.DATABASE_URL as string,
    RMQ_URL: envVars.RMQ_URL as string,
    REDIS_HOST: envVars.REDIS_HOST as string,
    REDIS_PORT: envVars.REDIS_PORT as number,
    JWT_SECRET: envVars.JWT_SECRET as string,
};