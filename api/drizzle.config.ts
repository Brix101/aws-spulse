import { defineConfig } from "drizzle-kit";
import { env } from "./src/env.mjs";

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/schema/*.ts",
  out: "./drizzle",
  dbCredentials: {
    // url: "postgresql://postgres:postgres@localhost/aws_spulse?schema=public&connection_limit=1&pool_timeout=1",
    host: env.DATABASE_HOST,
    port: env.DATABASE_PORT,
    user: env.DATABASE_USER,
    password: env.DATABASE_PASSWORD,
    database: env.DATABASE_NAME,
  },
});
