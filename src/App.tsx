import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import AdminLayout from "./components/AdminLayout";
import Dashboard from "./pages/Dashboard";
import ManageUsersPage from "./pages/ManageUsersPage";
import DepositUpdatePage from "./pages/DepositUpdatePage";
import WithdrawManagePage from "./pages/WithdrawManagePage";
import GameManagerPage from "./pages/GameManagerPage";
import PlaceholderPage from "./pages/PlaceholderPage";
import LoginPage from "./pages/LoginPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function ProtectedRoutes() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <AdminLayout />;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route element={<ProtectedRoutes />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/wingo/:duration" element={<GameManagerPage />} />
              <Route path="/k3/:duration" element={<GameManagerPage />} />
              <Route path="/5d/:duration" element={<GameManagerPage />} />
              <Route path="/finance/deposit-update" element={<DepositUpdatePage />} />
              <Route path="/finance/withdraw-apply" element={<WithdrawManagePage />} />
              <Route path="/finance/usdt-rate" element={<PlaceholderPage />} />
              <Route path="/finance/withdraw-sent" element={<PlaceholderPage />} />
              <Route path="/finance/withdraw-reject" element={<PlaceholderPage />} />
              <Route path="/support/:type" element={<PlaceholderPage />} />
              <Route path="/extra/:type" element={<PlaceholderPage />} />
              <Route path="/manage/users" element={<ManageUsersPage />} />
              <Route path="/manage/gift-code" element={<PlaceholderPage />} />
              <Route path="/manage/bonus" element={<PlaceholderPage />} />
              <Route path="/manage/users-deposit" element={<PlaceholderPage />} />
              <Route path="/manage/illegal-bet" element={<PlaceholderPage />} />
              <Route path="/manage/bank-details" element={<PlaceholderPage />} />
              <Route path="/manage/admin-password" element={<PlaceholderPage />} />
              <Route path="/manage/check-ip" element={<PlaceholderPage />} />
              <Route path="/manage/ban-users" element={<PlaceholderPage />} />
              <Route path="/manage/users-query" element={<PlaceholderPage />} />
              <Route path="/manage/demo-user" element={<PlaceholderPage />} />
              <Route path="/manage/agent-user" element={<PlaceholderPage />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
