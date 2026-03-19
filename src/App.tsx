import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index.tsx";
import WorkerView from "./pages/WorkerView.tsx";
import AdminDashboard from "./pages/AdminDashboard.tsx";
import AdminWorkers from "./pages/AdminWorkers.tsx";
import AdminPolicies from "./pages/AdminPolicies.tsx";
import AdminClaims from "./pages/AdminClaims.tsx";
import AdminPayouts from "./pages/AdminPayouts.tsx";
import AdminAnalytics from "./pages/AdminAnalytics.tsx";
import AdminChatbot from "./pages/AdminChatbot.tsx";
import Onboarding from "./pages/Onboarding.tsx";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/onboard" element={<Onboarding />} />
          <Route path="/worker" element={<WorkerView />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/workers" element={<AdminWorkers />} />
          <Route path="/admin/policies" element={<AdminPolicies />} />
          <Route path="/admin/claims" element={<AdminClaims />} />
          <Route path="/admin/payouts" element={<AdminPayouts />} />
          <Route path="/admin/analytics" element={<AdminAnalytics />} />
          <Route path="/admin/chatbot" element={<AdminChatbot />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
