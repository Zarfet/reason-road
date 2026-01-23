import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AssessmentProvider } from "@/context/AssessmentContext";
import Landing from "./pages/Landing";
import Assessment from "./pages/Assessment";
import Results from "./pages/Results";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AssessmentProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/assessment" element={<Assessment />} />
            <Route path="/results" element={<Results />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AssessmentProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
