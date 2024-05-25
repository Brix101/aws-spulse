import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";

import { env } from "~/env.mjs";
import { users } from "~/schema/users";

const pool = new pg.Pool({
  host: env.DATABASE_HOST,
  port: env.DATABASE_PORT,
  user: env.DATABASE_USER,
  password: env.DATABASE_PASSWORD,
  database: env.DATABASE_NAME,
});

export const db = drizzle(pool, {
  logger: true,
  schema: {
    users,
  },
});
