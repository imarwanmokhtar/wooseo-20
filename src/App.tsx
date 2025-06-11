
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { MultiStoreProvider } from "@/contexts/MultiStoreContext";
import { SeoPluginProvider } from "@/contexts/SeoPluginContext";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ResetPassword from "./pages/ResetPassword";
import Dashboard from "./pages/Dashboard";
import ContentGeneration from "./pages/ContentGeneration";
import Settings from "./pages/Settings";
import PaymentSuccess from "./pages/PaymentSuccess";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import ProductsExtractor from "./pages/ProductsExtractor";
import NotFound from "./pages/NotFound";
import "./App.css";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <BrowserRouter>
          <AuthProvider>
            <MultiStoreProvider>
              <SeoPluginProvider>
                <Toaster />
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/reset-password" element={<ResetPassword />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/content-generation" element={<ContentGeneration />} />
                  <Route path="/products-extractor" element={<ProductsExtractor />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="/payment-success" element={<PaymentSuccess />} />
                  <Route path="/blog" element={<Blog />} />
                  <Route path="/blog/:slug" element={<BlogPost />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </SeoPluginProvider>
            </MultiStoreProvider>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
