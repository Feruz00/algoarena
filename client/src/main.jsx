import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router";
import { ConfigProvider } from "antd";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

import { Toaster } from "react-hot-toast";
import "nprogress/nprogress.css";

import NProgressProvider from "./components/NProgressProvider.jsx";

import App from "./App.jsx";
import "./i18n/index.js";
import "./index.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import SocketProvider from "./context/SocketProvider.jsx";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 0,
      refetchOnWindowFocus: false,
      refetchOnMount: true,
      retry: 3,
    },
    mutations: {
      retry: false,
    },
  },
});

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <SocketProvider>
          <ReactQueryDevtools initialIsOpen={false} />
          <ConfigProvider
            theme={{
              token: {
                colorPrimary: "#2563eb",
                borderRadius: 10,
                fontFamily:
                  'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
              },
            }}
          >
            <NProgressProvider>
              <App />
            </NProgressProvider>
          </ConfigProvider>
          <Toaster
            position="bottom-right"
            gutter={12}
            containerStyle={{ margin: "8px" }}
            toastOptions={{
              success: {
                duration: 3000,
              },
              error: {
                duration: 5000,
              },
              style: {
                fontSize: "16px",
                maxWidth: "500px",
                padding: "16px 24px",
                backgroundColor: "#fff",
                color: "#374151",
              },
            }}
          />
        </SocketProvider>
      </QueryClientProvider>
    </BrowserRouter>
  </StrictMode>,
);
