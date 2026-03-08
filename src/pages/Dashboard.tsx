import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  UserPlus, IndianRupee, ArrowDownToLine, Wallet, Users,
  Clock, CheckCircle, ArrowUpFromLine, AlertTriangle,
  TrendingUp, Trophy, Percent, Settings, Save,
} from "lucide-react";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export default function Dashboard() {
  const queryClient = useQueryClient();
  const today = new Date();
  const todayStr = today.toISOString().split("T")[0];

  const { data: totalUsers = 0 } = useQuery({
    queryKey: ["dashboard-total-users"],
    queryFn: async () => {
      const { count } = await supabase.from("users").select("*", { count: "exact", head: true }).eq("is_demo", false);
      return count || 0;
    },
  });

  const { data: todayUsers = 0 } = useQuery({
    queryKey: ["dashboard-today-users"],
    queryFn: async () => {
      const { count } = await supabase.from("users").select("*", { count: "exact", head: true }).eq("is_demo", false).gte("created_at", todayStr);
      return count || 0;
    },
  });

  const { data: userBalance = 0 } = useQuery({
    queryKey: ["dashboard-user-balance"],
    queryFn: async () => {
      const { data } = await supabase.from("users").select("balance").eq("is_demo", false);
      return data?.reduce((sum, u) => sum + Number(u.balance), 0) || 0;
    },
  });

  const { data: depositStats } = useQuery({
    queryKey: ["dashboard-deposits"],
    queryFn: async () => {
      const { data: todayApproved } = await supabase.from("deposits").select("amount").eq("status", "approved").gte("created_at", todayStr);
      const { data: todayWithdraw } = await supabase.from("withdrawals").select("amount").eq("status", "approved").gte("created_at", todayStr);
      const { data: pendingDep } = await supabase.from("deposits").select("amount").eq("status", "pending");
      const { data: successDep } = await supabase.from("deposits").select("amount").eq("status", "approved");
      const { data: totalWith } = await supabase.from("withdrawals").select("amount").eq("status", "approved");
      const { data: pendingWith } = await supabase.from("withdrawals").select("amount").eq("status", "pending");
      const sum = (arr: any[] | null) => arr?.reduce((s, r) => s + Number(r.amount), 0) || 0;
      return {
        todayRecharge: sum(todayApproved),
        todayWithdraw: sum(todayWithdraw),
        pendingRecharge: sum(pendingDep),
        successRecharge: sum(successDep),
        totalWithdrawal: sum(totalWith),
        withdrawalRequests: sum(pendingWith),
      };
    },
  });

  const { data: betStats } = useQuery({
    queryKey: ["dashboard-bets"],
    queryFn: async () => {
      const { data: todayBets } = await supabase.from("bets").select("amount, win_amount, result").gte("created_at", todayStr);
      const totalBet = todayBets?.reduce((s, b) => s + Number(b.amount), 0) || 0;
      const totalWin = todayBets?.filter(b => b.result === "win").reduce((s, b) => s + Number(b.win_amount || 0), 0) || 0;
      return { totalBet, totalWin, profit: totalBet - totalWin };
    },
  });

  // Game Settings
  const { data: settings } = useQuery({
    queryKey: ["game-settings"],
    queryFn: async () => {
      const { data, error } = await supabase.from("game_settings").select("*").eq("id", 1).single();
      if (error) throw error;
      return data;
    },
  });

  const [gameMode, setGameMode] = useState("");
  const [processType, setProcessType] = useState("");
  const currentMode = gameMode || settings?.game_mode || "wingo";
  const currentProcess = processType || settings?.process_type || "highest_bet_wins";

  const settingsMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("game_settings").update({ game_mode: currentMode, process_type: currentProcess }).eq("id", 1);
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Settings saved"); queryClient.invalidateQueries({ queryKey: ["game-settings"] }); },
    onError: () => toast.error("Failed to save"),
  });

  const fmt = (n: number) => `₹${n.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;

  type CardColor = "emerald" | "blue" | "orange" | "red";

  const cardStyles: Record<CardColor, { bg: string; glow: string; iconBg: string }> = {
    emerald: {
      bg: 'linear-gradient(135deg, hsl(160, 60%, 12%) 0%, hsl(160, 40%, 8%) 100%)',
      glow: '0 0 30px hsl(160, 84%, 39% / 0.1)',
      iconBg: 'hsl(160, 84%, 39% / 0.15)',
    },
    blue: {
      bg: 'linear-gradient(135deg, hsl(225, 50%, 14%) 0%, hsl(225, 40%, 9%) 100%)',
      glow: '0 0 30px hsl(225, 73%, 57% / 0.1)',
      iconBg: 'hsl(225, 73%, 57% / 0.15)',
    },
    orange: {
      bg: 'linear-gradient(135deg, hsl(30, 50%, 12%) 0%, hsl(30, 40%, 8%) 100%)',
      glow: '0 0 30px hsl(38, 92%, 50% / 0.1)',
      iconBg: 'hsl(38, 92%, 50% / 0.15)',
    },
    red: {
      bg: 'linear-gradient(135deg, hsl(0, 45%, 13%) 0%, hsl(0, 35%, 8%) 100%)',
      glow: '0 0 30px hsl(0, 72%, 51% / 0.1)',
      iconBg: 'hsl(0, 72%, 51% / 0.15)',
    },
  };

  const cards: { title: string; value: string | number; icon: React.ElementType; color: CardColor }[] = [
    { title: "Today User Join", value: todayUsers, icon: UserPlus, color: "emerald" },
    { title: "Today's Recharge", value: fmt(depositStats?.todayRecharge || 0), icon: IndianRupee, color: "emerald" },
    { title: "Today's Withdrawal", value: fmt(depositStats?.todayWithdraw || 0), icon: ArrowDownToLine, color: "orange" },
    { title: "User Balance", value: fmt(userBalance), icon: Wallet, color: "blue" },
    { title: "Total Users", value: totalUsers, icon: Users, color: "blue" },
    { title: "Pending Recharge", value: fmt(depositStats?.pendingRecharge || 0), icon: Clock, color: "orange" },
    { title: "Success Recharge", value: fmt(depositStats?.successRecharge || 0), icon: CheckCircle, color: "emerald" },
    { title: "Total Withdrawal", value: fmt(depositStats?.totalWithdrawal || 0), icon: ArrowUpFromLine, color: "blue" },
    { title: "Withdrawal Requests", value: fmt(depositStats?.withdrawalRequests || 0), icon: AlertTriangle, color: "red" },
    { title: "Today's Total Bet", value: fmt(betStats?.totalBet || 0), icon: TrendingUp, color: "blue" },
    { title: "Today's Total Win", value: fmt(betStats?.totalWin || 0), icon: Trophy, color: "emerald" },
    { title: "Today's Profit", value: fmt(betStats?.profit || 0), icon: Percent, color: "emerald" },
  ];

  return (
    <div>
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground font-display tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">Real-time platform overview and analytics</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 mb-6">
        {cards.map((card) => {
          const style = cardStyles[card.color];
          return (
            <div
              key={card.title}
              className="rounded-xl p-4 relative overflow-hidden border border-[hsl(225,15%,14%)] transition-all duration-300 hover:scale-[1.02] hover:border-[hsl(225,15%,20%)]"
              style={{ background: style.bg, boxShadow: style.glow }}
            >
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-[10px] font-semibold text-[hsl(220,12%,50%)] uppercase tracking-wider font-display">
                    {card.title}
                  </p>
                  <div 
                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ background: style.iconBg }}
                  >
                    <card.icon className="w-4 h-4 text-white/70" />
                  </div>
                </div>
                <p className="text-xl font-bold text-white font-display tracking-tight">{card.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Game Settings */}
      <div 
        className="rounded-xl border border-[hsl(225,15%,14%)] p-6"
        style={{
          background: 'linear-gradient(135deg, hsl(228, 25%, 8%) 0%, hsl(230, 22%, 6%) 100%)',
        }}
      >
        <div className="flex items-center gap-3 mb-5">
          <div 
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, hsl(var(--login-accent) / 0.15), hsl(var(--login-accent) / 0.05))',
              boxShadow: '0 0 0 1px hsl(var(--login-accent) / 0.2)',
            }}
          >
            <Settings className="w-4 h-4 text-[hsl(var(--login-accent))]" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white font-display">Game Settings</h3>
            <p className="text-[11px] text-[hsl(220,12%,40%)]">Configure game modes and processing</p>
          </div>
        </div>
        <div className="grid sm:grid-cols-2 gap-4 mb-5">
          <div>
            <label className="text-[11px] font-semibold text-[hsl(220,12%,45%)] mb-2 block font-display uppercase tracking-wider">
              Game Mode
            </label>
            <select
              value={currentMode}
              onChange={(e) => setGameMode(e.target.value)}
              className="w-full h-11 rounded-xl text-sm px-4 border outline-none transition-all duration-200 font-sans text-white"
              style={{
                background: 'hsl(230, 22%, 7%)',
                borderColor: 'hsl(225, 15%, 16%)',
              }}
            >
              <option value="wingo">WinGo</option>
              <option value="k3">K3</option>
              <option value="5d">5D</option>
            </select>
          </div>
          <div>
            <label className="text-[11px] font-semibold text-[hsl(220,12%,45%)] mb-2 block font-display uppercase tracking-wider">
              Process Type
            </label>
            <select
              value={currentProcess}
              onChange={(e) => setProcessType(e.target.value)}
              className="w-full h-11 rounded-xl text-sm px-4 border outline-none transition-all duration-200 font-sans text-white"
              style={{
                background: 'hsl(230, 22%, 7%)',
                borderColor: 'hsl(225, 15%, 16%)',
              }}
            >
              <option value="highest_bet_wins">Higher Bet Wins</option>
              <option value="random">Random</option>
              <option value="default">Higher Bet Lose</option>
            </select>
          </div>
        </div>
        <button
          onClick={() => settingsMutation.mutate()}
          disabled={settingsMutation.isPending}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-semibold text-white transition-all duration-300 disabled:opacity-50 active:scale-[0.97] font-display login-shimmer-btn"
          style={{
            background: 'linear-gradient(135deg, hsl(var(--login-accent)), hsl(160,70%,35%), hsl(var(--login-accent)))',
            boxShadow: '0 4px 20px hsl(var(--login-accent-glow) / 0.2), 0 0 0 1px hsl(var(--login-accent) / 0.2)',
          }}
        >
          <Save className="w-4 h-4" />
          {settingsMutation.isPending ? "Saving..." : "Save Settings"}
        </button>
      </div>
    </div>
  );
}
