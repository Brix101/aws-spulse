import {
  createTRPCQueryUtils,
  createTRPCReact,
  httpBatchLink,
  loggerLink,
  type inferReactQueryProcedureOptions,
} from "@trpc/react-query";
import type { inferRouterInputs, inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "@aws-spulse/api";
import { QueryClient, QueryCache, MutationCache } from "@tanstack/react-query";
import { toast } from "sonner";

// infer the types for your router
export type ReactQueryOptions = inferReactQueryProcedureOptions<AppRouter>;
export type RouterInputs = inferRouterInputs<AppRouter>;
export type RouterOutputs = inferRouterOutputs<AppRouter>;

export const trpc = createTRPCReact<AppRouter>();

export const trpcClient = trpc.createClient({
  links: [
    loggerLink({
      enabled: (opts) =>
        (import.meta.env.DEV && typeof window !== "undefined") ||
        (opts.direction === "down" && opts.result instanceof Error),
    }),
    httpBatchLink({
      url: "/trpc",
    }),
  ],
});

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
    },
  },
  queryCache: new QueryCache({
    onError: (error) => {
      toast.error(
        `An error occurred: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    },
  }),
  mutationCache: new MutationCache({
    onError: (error) => {
      toast.error(
        `An error occurred: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    },
  }),
});

export const clientUtils = createTRPCQueryUtils({
  queryClient,
  client: trpcClient,
});
