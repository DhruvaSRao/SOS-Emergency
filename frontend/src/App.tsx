import { Toaster } from "./components/ui/toaster";
import { Toaster as Sonner } from "./components/ui/sonner";
import { TooltipProvider } from "./components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";

import LandingPage from "./pages/LandingPage";
import UserLogin from "./pages/UserLogin";
import UserSignup from "./pages/UserSignup";
import CalculatorPage from "./pages/CalculatorPage";
import HistoryPage from "./pages/HistoryPage";
import PoliceLogin from "./pages/PoliceLogin";
import PoliceDashboard from "./pages/PoliceDashboard";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Landing */}
            <Route path="/" element={<LandingPage />} />

            {/* User routes */}
            <Route path="/login" element={<UserLogin />} />
            <Route path="/register" element={<UserSignup />} />
            <Route path="/calculator" element={<CalculatorPage />} />
            <Route path="/history" element={<HistoryPage />} />

            {/* Police routes */}
            <Route path="/police/login" element={<PoliceLogin />} />
            <Route path="/dashboard" element={<PoliceDashboard />} />

            {/* Fallback */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;



