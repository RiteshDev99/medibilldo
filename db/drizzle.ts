import { config } from "dotenv";
import { drizzle } from "drizzle-orm/neon-http";
import { neonConfig } from "@neondatabase/serverless";
import { schema } from "./schema";
import "@/lib/env";

config({ path: ".env" }); // or .env.local

// Add auto-retry to Neon HTTP fetch to handle serverless cold starts and transient connection drops
neonConfig.fetchFunction = async (
  input: Parameters<typeof fetch>[0],
  init?: Parameters<typeof fetch>[1]
) => {
  const maxRetries = 2;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(input, init);
      if (response.status >= 500 && attempt < maxRetries) {
        await new Promise((resolve) => setTimeout(resolve, 500 * (attempt + 1)));
        continue;
      }
      return response;
    } catch (error) {
      if (attempt < maxRetries) {
        await new Promise((resolve) => setTimeout(resolve, 500 * (attempt + 1)));
      } else {
        throw error;
      }
    }
  }
  return fetch(input, init);
};

export const db = drizzle(process.env.DATABASE_URL as string, { schema });
