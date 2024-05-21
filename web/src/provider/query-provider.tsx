import { QueryClientProvider } from "@tanstack/react-query";
import React from "react";

import { trpc } from "@/utils/trpc";
import { httpBatchLink, loggerLink } from "@trpc/client";
import { queryClient } from "@/lib/react-query";

export function QueryProvider({ children }: React.PropsWithChildren) {
  const [trpcClient] = React.useState(() =>
    trpc.createClient({
      links: [
        loggerLink({
          enabled: (opts) =>
            (import.meta.env.DEV && typeof window !== "undefined") ||
            (opts.direction === "down" && opts.result instanceof Error),
        }),
        httpBatchLink({
          url: "/trpc",
          // You can pass any HTTP headers you wish here
          // async headers() {
          //   return {
          //     authorization: getAuthCookie(),
          //   };
          // },
        }),
      ],
    }),
  );
  return (
    <>
      <trpc.Provider client={trpcClient} queryClient={queryClient}>
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      </trpc.Provider>
    </>
  );
}
