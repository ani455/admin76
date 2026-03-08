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

  const cards = [
    { title: "Today User Join", value: todayUsers, icon: UserPlus, bg: "#3362ff" },
    { title: "Today's Recharge", value: fmt(depositStats?.todayRecharge || 0), icon: IndianRupee, bg: "#22c55e" },
    { title: "Today's Withdrawal", value: fmt(depositStats?.todayWithdraw || 0), icon: ArrowDownToLine, bg: "#f97316" },
    { title: "User Balance", value: fmt(userBalance), icon: Wallet, bg: "#3362ff" },
    { title: "Total Users", value: totalUsers, icon: Users, bg: "#3362ff" },
    { title: "Pending Recharge", value: fmt(depositStats?.pendingRecharge || 0), icon: Clock, bg: "#3362ff" },
    { title: "Success Recharge", value: fmt(depositStats?.successRecharge || 0), icon: CheckCircle, bg: "#3362ff" },
    { title: "Total Withdrawal", value: fmt(depositStats?.totalWithdrawal || 0), icon: ArrowUpFromLine, bg: "#3362ff" },
    { title: "Withdrawal Requests", value: fmt(depositStats?.withdrawalRequests || 0), icon: AlertTriangle, bg: "#ef4444" },
    { title: "Today's Total Bet", value: fmt(betStats?.totalBet || 0), icon: TrendingUp, bg: "#3362ff" },
    { title: "Today's Total Win", value: fmt(betStats?.totalWin || 0), icon: Trophy, bg: "#3362ff" },
    { title: "Today's Profit", value: fmt(betStats?.profit || 0), icon: Percent, bg: "#22c55e" },
  ];

  return (
    <div>
      {/* Stats Grid - matching original blue cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 mb-5">
        {cards.map((card) => (
          <div
            key={card.title}
            className="rounded-lg p-4 text-white relative overflow-hidden"
            style={{ backgroundColor: card.bg }}
          >
            <div className="relative z-10">
              <p className="text-[11px] font-medium opacity-85 mb-1 uppercase tracking-wide">{card.title}</p>
              <p className="text-xl font-bold">{card.value}</p>
            </div>
            <card.icon className="absolute right-3 bottom-3 w-8 h-8 opacity-15" />
          </div>
        ))}
      </div>

      {/* Game Settings */}
      <div className="bg-card rounded-lg border p-5">
        <div className="flex items-center gap-2 mb-4">
          <Settings className="w-4 h-4 text-muted-foreground" />
          <h3 className="text-sm font-semibold text-foreground">Game Settings</h3>
        </div>
        <div className="grid sm:grid-cols-2 gap-3 mb-4">
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Game Mode</label>
            <select
              value={currentMode}
              onChange={(e) => setGameMode(e.target.value)}
              className="w-full h-9 rounded-md bg-muted text-sm px-3 border-0 outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="wingo">WinGo</option>
              <option value="k3">K3</option>
              <option value="5d">5D</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Process Type</label>
            <select
              value={currentProcess}
              onChange={(e) => setProcessType(e.target.value)}
              className="w-full h-9 rounded-md bg-muted text-sm px-3 border-0 outline-none focus:ring-2 focus:ring-primary"
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
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md text-xs font-semibold bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-50 transition-opacity"
        >
          <Save className="w-3.5 h-3.5" />
          {settingsMutation.isPending ? "Saving..." : "Save Settings"}
        </button>
      </div>
    </div>
  );
}