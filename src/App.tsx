import React, { useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { AuthProvider } from "./contexts/AuthContext";
import { MultiStoreProvider } from "./contexts/MultiStoreContext";

import Header from "./components/Header";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ResetPassword from "./pages/ResetPassword";
import Dashboard from "./pages/Dashboard";
import ContentGeneration from "./pages/ContentGeneration";
import Settings from "./pages/Settings";
import PaymentSuccess from "./pages/PaymentSuccess";
import NotFound from "./pages/NotFound";
import { Analytics } from "@vercel/analytics/react"
import { initGA } from "./ga";

// Create the React-Query client once (outside the component)
const queryClient = new QueryClient();

function App() {
  // Initialise Google Analytics once on mount
  useEffect(() => {
    initGA();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <BrowserRouter>
          <AuthProvider>
            <MultiStoreProvider>
              <div className="min-h-screen bg-gray-50">
                <Header />
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/reset-password" element={<ResetPassword />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route
                    path="/content-generation"
                    element={<ContentGeneration />}
                  />
                  <Route path="/settings" element={<Settings />} />
                  <Route
                    path="/payment-success"
                    element={<PaymentSuccess />}
                  />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </div>
            </MultiStoreProvider>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
