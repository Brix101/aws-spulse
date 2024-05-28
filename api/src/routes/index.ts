import { createTRPCRouter } from "../trpc";
import { authRoutes } from "./auth";
import { userRoutes } from "./user";

export const appRouter = createTRPCRouter({
  auth: authRoutes,
  user: userRoutes,
});

export type AppRouter = typeof appRouter;
