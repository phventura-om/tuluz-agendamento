import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

import { AgendarPage } from "./pages/AgendarPage";
import { AdminPage } from "./pages/AdminPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Home = tela da Lovable */}
          <Route path="/" element={<Index />} />

          {/* rota técnica, com o form “padrão” que criamos */}
          <Route path="/agendar" element={<AgendarPage />} />

          {/* painel da equipe */}
          <Route path="/admin" element={<AdminPage />} />

          {/* rota coringa */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
