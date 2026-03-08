import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AdminLayout from "./components/AdminLayout";
import Dashboard from "./pages/Dashboard";
import ManageUsersPage from "./pages/ManageUsersPage";
import DepositUpdatePage from "./pages/DepositUpdatePage";
import WithdrawManagePage from "./pages/WithdrawManagePage";
import GameManagerPage from "./pages/GameManagerPage";
import PlaceholderPage from "./pages/PlaceholderPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route element={<AdminLayout />}>
            <Route path="/" element={<Dashboard />} />
            {/* Game Managers */}
            <Route path="/wingo/:duration" element={<GameManagerPage />} />
            <Route path="/k3/:duration" element={<GameManagerPage />} />
            <Route path="/5d/:duration" element={<GameManagerPage />} />
            {/* Finance */}
            <Route path="/finance/deposit-update" element={<DepositUpdatePage />} />
            <Route path="/finance/withdraw-apply" element={<WithdrawManagePage />} />
            <Route path="/finance/usdt-rate" element={<PlaceholderPage />} />
            <Route path="/finance/withdraw-sent" element={<PlaceholderPage />} />
            <Route path="/finance/withdraw-reject" element={<PlaceholderPage />} />
            {/* Support */}
            <Route path="/support/:type" element={<PlaceholderPage />} />
            {/* Extra */}
            <Route path="/extra/:type" element={<PlaceholderPage />} />
            {/* Manage */}
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
  </QueryClientProvider>
);

export default App;
