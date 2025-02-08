import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
	PORT: z.string(),
	DB_URL: z.string(),
	NODE_ENV: z.string(),
	PRIVATE_KEY: z.string(),
	REDIS_URL: z.string(),
	OPENAI_API_KEY: z.string(),
});

export const env = envSchema.parse(process.env);
