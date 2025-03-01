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
}).unknown(true);

const { error, value } = envSchema.validate(process.env);
if(error) throw Error('Config validation error: ' + error.message);

// Get the environment variables
interface Env {
    REDIS_HOST: string;
    REDIS_PORT: number;
    RMQ_URL: string;
}
const envVars: Env = value;

// Export the environment variables
export const envs = {
    REDIS_HOST: envVars.REDIS_HOST as string,
    REDIS_PORT: envVars.REDIS_PORT as number,
    RMQ_URL: envVars.RMQ_URL as string,
};