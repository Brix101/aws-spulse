import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import React from "react";
import ReactDOM from "react-dom/client";

import App from "@/App.tsx";
import { QueryProvider } from "@/provider/query-provider.tsx";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryProvider>
      <App />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryProvider>
  </React.StrictMode>,
);
