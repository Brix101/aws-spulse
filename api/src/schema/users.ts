import { sql } from "drizzle-orm";
import { boolean, integer, pgTable, text, uuid } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: uuid("id")
    .primaryKey()
    .default(sql`uuid_generate_v4()`),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  refreshTokenVersion: integer("token_version").notNull().default(0),
  passwordHash: text("password_hash").notNull(),
  confirmed: boolean("confirmed").notNull().default(false),
});

export type User = typeof users.$inferSelect;
