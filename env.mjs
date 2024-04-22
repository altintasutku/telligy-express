import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = createEnv({
  server: {
    PORT: z.string(),
    DATABASE_URL: z.string(),
    SUPABASE_SECRET: z.string(),
  },
  client: {
    
  },
  runtimeEnv: {
    PORT: process.env.PORT,
    DATABASE_URL: process.env.DATABASE_URL,
    SUPABASE_SECRET: process.env.SUPABASE_SECRET,
  },
});