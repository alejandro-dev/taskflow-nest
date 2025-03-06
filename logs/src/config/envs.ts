import "dotenv/config";
import * as joi from "joi";

/**
 * 
 * @param joi 
 * @returns 
 * @description Validate the environment variables
 */
const envSchema = joi.object({
    RMQ_URL: joi.string().required(),
    DATABASE_URL: joi.string().required(),
}).unknown(true);

const { error, value } = envSchema.validate(process.env);
if(error) throw Error('Config validation error: ' + error.message);

// Get the environment variables
interface Env {
    RMQ_URL: string;
    DATABASE_URL: string;
}
const envVars: Env = value;

// Export the environment variables
export const envs = {
    RMQ_URL: envVars.RMQ_URL as string,
    DATABASE_URL: envVars.DATABASE_URL as string,
};