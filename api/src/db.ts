import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { users } from "./schema/users";

//"postgresql://postgres:postgres@localhost/aws_spulse?schema=public&connection_limit=1&pool_timeout=1",

const pool = new Pool({
  host: "localhost",
  port: 5432,
  user: "postgres",
  password: "postgres",
  database: "aws_spulse",
});

export const db = drizzle(pool, {
  logger: true,
  schema: {
    users,
  },
});
