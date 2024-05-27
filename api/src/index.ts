import { User } from "./schema/users";
import { appRouter, startServer } from "./server";

void startServer();

export type AppRouter = typeof appRouter;
export type UserResource = Omit<
  User,
  "passwordHash" | "confirmed" | "refreshTokenVersion"
>;
