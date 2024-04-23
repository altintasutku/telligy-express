import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = createEnv({
  server: {
    PORT: z.string(),
    DATABASE_URL: z.string(),
    SUPABASE_SECRET: z.string(),
    IYZICO_URL: z.string(),
    IYZICO_API_KEY: z.string(),
    IYZICO_SECRET_KEY: z.string(),
  },
  client: {
    
  },
  runtimeEnv: {
    PORT: process.env.PORT,
    DATABASE_URL: process.env.DATABASE_URL,
    SUPABASE_SECRET: process.env.SUPABASE_SECRET,
    IYZICO_URL: process.env.IYZICO_URL,
    IYZICO_API_KEY: process.env.IYZICO_API_KEY,
    IYZICO_SECRET_KEY: process.env.IYZICO_SECRET_KEY,
  },
});