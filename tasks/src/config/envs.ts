import "dotenv/config";
import * as joi from "joi";

/**
 * 
 * @param joi 
 * @returns 
 * @description Validate the environment variables
 */
const envSchema = joi.object({
    PORT: joi.number().default(3002),
    DATABASE_URL: joi.string().required(),
    RMQ_URL: joi.string().required(),
    NODE_ENV: joi.string().valid("development", "production", "test").default("development"),
}).unknown(true);

const { error, value } = envSchema.validate(process.env);
if(error) throw Error('Config validation error: ' + error.message);

// Get the environment variables
interface Env {
    PORT: number;
    DATABASE_URL: string;
    RMQ_URL: string;
    NODE_ENV: string;
}
const envVars: Env = value;

// Export the environment variables
export const envs = {
    PORT: envVars.PORT as number,
    DATABASE_URL: envVars.DATABASE_URL as string,
    RMQ_URL: envVars.RMQ_URL as string,
    NODE_ENV: envVars.NODE_ENV as string
};