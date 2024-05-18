import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/schema/*.ts",
  out: "./drizzle",
  dbCredentials: {
    url: "postgresql://postgres:postgres@localhost/aws_spulse?schema=public&connection_limit=1&pool_timeout=1",
  },
});
