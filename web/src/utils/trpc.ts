import type { AppRouter } from "@aws-spulse/api";
import { MutationCache, QueryCache, QueryClient } from "@tanstack/react-query";
import {
  createTRPCQueryUtils,
  createTRPCReact,
  httpBatchLink,
  loggerLink,
  type inferReactQueryProcedureOptions,
} from "@trpc/react-query";
import { toast } from "sonner";
import superjson from "superjson";

// infer the types for your router
export type ReactQueryOptions = inferReactQueryProcedureOptions<AppRouter>;

export const trpc = createTRPCReact<AppRouter>();

export const trpcClient = trpc.createClient({
  links: [
    loggerLink({
      enabled: (opts) =>
        (import.meta.env.DEV && typeof window !== "undefined") ||
        (opts.direction === "down" && opts.result instanceof Error),
    }),
    httpBatchLink({
      transformer: superjson,
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
