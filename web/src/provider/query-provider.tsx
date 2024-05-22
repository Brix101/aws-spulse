import { QueryClientProvider } from "@tanstack/react-query";
import React from "react";

import { queryClient, trpc, trpcClient } from "@/utils/trpc";

export function QueryProvider({ children }: React.PropsWithChildren) {
  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </trpc.Provider>
  );
}
