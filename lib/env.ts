import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  BETTER_AUTH_URL: z.string().min(1, "BETTER_AUTH_URL is required"),
  BETTER_AUTH_SECRET: z.string().min(1, "BETTER_AUTH_SECRET is required"),
  RESEND_API_KEY: z.string().min(1, "RESEND_API_KEY is required"),
  EMAIL_SENDER_NAME: z.string().optional(),
  EMAIL_SENDER_ADDRESS: z.string().optional(),
});

// Validate process.env values
const parseResult = envSchema.safeParse(process.env);

if (!parseResult.success) {
  console.error("❌ Environment configuration validation failed:");
  console.error(parseResult.error.format());
  throw new Error("Invalid server environment configuration");
}

export const env = parseResult.data;
