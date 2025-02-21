import "dotenv/config";
import * as joi from "joi";

const envSchema = joi.object({
    PORT: joi.number().required(),
    RMQ_URL: joi.string().required(),
}).unknown(true);

const { error, value } = envSchema.validate(process.env);
if(error) throw Error('Config validation error: ' + error.message);

interface Env {
    PORT: number;
    RMQ_URL: string;
}
const envVars: Env = value;

export const envs = {
    PORT: envVars.PORT as number,
    RMQ_URL: envVars.RMQ_URL as string
};