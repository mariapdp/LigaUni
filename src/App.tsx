import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createHashRouter, RouterProvider } from "react-router-dom";
import { ProvedorAutenticacao } from "./hooks/use-auth";
import { routers } from "./router";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const router = createHashRouter(routers);

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ProvedorAutenticacao>
        <TooltipProvider>
          <Toaster />
          <Sonner position="top-right" theme="dark" />
          <RouterProvider router={router} />
        </TooltipProvider>
      </ProvedorAutenticacao>
    </QueryClientProvider>
  );
};

export default App;
