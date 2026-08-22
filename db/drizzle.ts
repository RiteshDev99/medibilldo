import { config } from "dotenv";
import { drizzle } from "drizzle-orm/neon-http";
import { schema } from "./schema";
import "@/lib/env";

config({ path: ".env" }); // or .env.local

export const db = drizzle(process.env.DATABASE_URL as string, { schema });
