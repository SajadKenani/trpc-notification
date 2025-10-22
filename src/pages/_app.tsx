import { trpc } from "@/utils/trpc";
import { httpBatchLink, loggerLink, splitLink, wsLink, createWSClient } from "@trpc/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import type { AppType } from "next/app";
import { NotificationProvider } from "@/components/NotificationProvider";

const getBaseUrl = () => {
  if (typeof window !== "undefined") return "";
  return `http://localhost:3000`;
};

const MyApp: AppType = ({ Component, pageProps }) => {
  const [queryClient] = useState(() => new QueryClient());

  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [
        loggerLink(),
        splitLink({
          condition(op) {
            return op.type === "subscription";
          },
          true: wsLink({
            client: createWSClient({
              url: getBaseUrl().replace(/^http/, "ws") + "/api/trpc",
            }),
          }),
          false: httpBatchLink({
            url: `${getBaseUrl()}/api/trpc`,
          }),
        }),
      ],
    })
  );

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <NotificationProvider>
          <Component {...pageProps} />
        </NotificationProvider>
      </QueryClientProvider>
    </trpc.Provider>
  );
};

export default MyApp;
