import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
	PORT: z.string(),
	DB_URL: z.string(),
});

export const env = envSchema.parse(process.env);
