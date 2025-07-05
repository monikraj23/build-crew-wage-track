import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
<<<<<<< HEAD
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Login from "./pages/LoginPage";
=======
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";

import Index from "@/pages/Index";
import Login from "@/pages/LoginPage";
import NotFound from "@/pages/NotFound";
import StockManager from "./components/StockManager";
import WorkerCategoryManager from "@/components/WorkerCategoryManager";
import SupervisorAttendance from "@/components/SupervisorAttendance";
import SupervisorBillUpload from "@/components/SupervisorBillUpload";
import Updates from "@/components/Updates"; // ✅ New Import

>>>>>>> 9f4c065 (Updated dashboard UI and added cost/worker metrics)
import { supabase } from "@/lib/supabase";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
<<<<<<< HEAD
    const session = supabase.auth.getSession().then(({ data }) => {
      setIsAuthenticated(!!data.session);
    });

    // Optional: Listen to auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
=======
    const getSession = async () => {
      const { data } = await supabase.auth.getSession();
      setIsAuthenticated(!!data.session);
    };

    getSession();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
>>>>>>> 9f4c065 (Updated dashboard UI and added cost/worker metrics)
      setIsAuthenticated(!!session);
    });

    return () => {
<<<<<<< HEAD
      authListener.subscription.unsubscribe();
    };
  }, []);

  if (isAuthenticated === null) return null; // loading state
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return children;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Index />
              </ProtectedRoute>
            }
          />
          <Route path="/login" element={<Login />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);
=======
      listener.subscription.unsubscribe();
    };
  }, []);

  if (isAuthenticated === null) {
    return <div className="p-6 text-gray-500">Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public Route */}
            <Route path="/login" element={<Login />} />

            {/* Protected Routes */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Index />
                </ProtectedRoute>
              }
            />
            <Route
              path="/stock"
              element={
                <ProtectedRoute>
                  <StockManager />
                </ProtectedRoute>
              }
            />
            <Route
              path="/workers"
              element={
                <ProtectedRoute>
                  <WorkerCategoryManager />
                </ProtectedRoute>
              }
            />
            <Route
              path="/attendance"
              element={
                <ProtectedRoute>
                  <SupervisorAttendance />
                </ProtectedRoute>
              }
            />
            <Route
              path="/upload-bill"
              element={
                <ProtectedRoute>
                  <SupervisorBillUpload />
                </ProtectedRoute>
              }
            />

            {/* ✅ New Route: Updates */}
            <Route
              path="/updates"
              element={
                <ProtectedRoute>
                  <Updates />
                </ProtectedRoute>
              }
            />

            {/* Fallback */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};
>>>>>>> 9f4c065 (Updated dashboard UI and added cost/worker metrics)

export default App;