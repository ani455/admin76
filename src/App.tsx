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
import WithdrawSentPage from "./pages/WithdrawSentPage";
import WithdrawRejectPage from "./pages/WithdrawRejectPage";
import UsdtRatePage from "./pages/UsdtRatePage";
import GameManagerPage from "./pages/GameManagerPage";
import GiftCodePage from "./pages/GiftCodePage";
import BonusManagePage from "./pages/BonusManagePage";
import BanUsersPage from "./pages/BanUsersPage";
import CheckIpPage from "./pages/CheckIpPage";
import UsersQueryPage from "./pages/UsersQueryPage";
import DemoUserPage from "./pages/DemoUserPage";
import AgentUserPage from "./pages/AgentUserPage";
import AdminPasswordPage from "./pages/AdminPasswordPage";
import BankDetailsPage from "./pages/BankDetailsPage";
import IllegalBetPage from "./pages/IllegalBetPage";
import SupportPage from "./pages/SupportPage";
import PlaceholderPage from "./pages/PlaceholderPage";
import UplineChainPage from "./pages/UplineChainPage";
import SubordinateDataPage from "./pages/SubordinateDataPage";
import BalanceDeductionPage from "./pages/BalanceDeductionPage";
import UsersActivityPage from "./pages/UsersActivityPage";
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
              <Route path="/finance/usdt-rate" element={<UsdtRatePage />} />
              <Route path="/finance/deposit-update" element={<DepositUpdatePage />} />
              <Route path="/finance/withdraw-apply" element={<WithdrawManagePage />} />
              <Route path="/finance/withdraw-sent" element={<WithdrawSentPage />} />
              <Route path="/finance/withdraw-reject" element={<WithdrawRejectPage />} />
              <Route path="/support/:type" element={<SupportPage />} />
              <Route path="/extra/:type" element={<PlaceholderPage />} />
              <Route path="/manage/users" element={<ManageUsersPage />} />
              <Route path="/manage/gift-code" element={<GiftCodePage />} />
              <Route path="/manage/bonus" element={<BonusManagePage />} />
              <Route path="/manage/users-deposit" element={<BonusManagePage />} />
              <Route path="/manage/illegal-bet" element={<IllegalBetPage />} />
              <Route path="/manage/bank-details" element={<BankDetailsPage />} />
              <Route path="/manage/admin-password" element={<AdminPasswordPage />} />
              <Route path="/manage/check-ip" element={<CheckIpPage />} />
              <Route path="/manage/ban-users" element={<BanUsersPage />} />
              <Route path="/manage/users-query" element={<UsersQueryPage />} />
              <Route path="/manage/demo-user" element={<DemoUserPage />} />
              <Route path="/manage/agent-user" element={<AgentUserPage />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
