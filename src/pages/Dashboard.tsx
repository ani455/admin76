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
import { motion } from "framer-motion";

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.04 } },
};

const cardAnim = {
  hidden: { opacity: 0, y: 15, scale: 0.97 },
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } },
};

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
    onSuccess: () => { toast.success("Settings saved successfully!"); queryClient.invalidateQueries({ queryKey: ["game-settings"] }); },
    onError: () => toast.error("Failed to save settings"),
  });

  const fmt = (n: number) => `₹${n.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;

  type CardColor = "green" | "blue" | "orange" | "red";

  const colorMap: Record<CardColor, { gradient: string; glow: string; iconColor: string; iconBg: string }> = {
    green: {
      gradient: 'linear-gradient(145deg, hsl(160, 40%, 12%) 0%, hsl(160, 30%, 7%) 100%)',
      glow: 'hsl(160, 84%, 39% / 0.08)',
      iconColor: 'hsl(160, 84%, 45%)',
      iconBg: 'hsl(160, 84%, 39% / 0.12)',
    },
    blue: {
      gradient: 'linear-gradient(145deg, hsl(210, 40%, 13%) 0%, hsl(210, 30%, 7%) 100%)',
      glow: 'hsl(210, 100%, 55% / 0.08)',
      iconColor: 'hsl(210, 100%, 60%)',
      iconBg: 'hsl(210, 100%, 55% / 0.12)',
    },
    orange: {
      gradient: 'linear-gradient(145deg, hsl(30, 40%, 12%) 0%, hsl(30, 30%, 7%) 100%)',
      glow: 'hsl(38, 92%, 50% / 0.08)',
      iconColor: 'hsl(38, 92%, 55%)',
      iconBg: 'hsl(38, 92%, 50% / 0.12)',
    },
    red: {
      gradient: 'linear-gradient(145deg, hsl(0, 35%, 13%) 0%, hsl(0, 25%, 7%) 100%)',
      glow: 'hsl(0, 72%, 51% / 0.08)',
      iconColor: 'hsl(0, 72%, 55%)',
      iconBg: 'hsl(0, 72%, 51% / 0.12)',
    },
  };

  const cards: { title: string; value: string | number; icon: React.ElementType; color: CardColor }[] = [
    { title: "Today User Join", value: todayUsers, icon: UserPlus, color: "green" },
    { title: "Today's Recharge", value: fmt(depositStats?.todayRecharge || 0), icon: IndianRupee, color: "green" },
    { title: "Today's Withdrawal", value: fmt(depositStats?.todayWithdraw || 0), icon: ArrowDownToLine, color: "orange" },
    { title: "User Balance", value: fmt(userBalance), icon: Wallet, color: "blue" },
    { title: "Total Users", value: totalUsers, icon: Users, color: "blue" },
    { title: "Pending Recharge", value: fmt(depositStats?.pendingRecharge || 0), icon: Clock, color: "orange" },
    { title: "Success Recharge", value: fmt(depositStats?.successRecharge || 0), icon: CheckCircle, color: "green" },
    { title: "Total Withdrawal", value: fmt(depositStats?.totalWithdrawal || 0), icon: ArrowUpFromLine, color: "blue" },
    { title: "Withdrawal Requests", value: fmt(depositStats?.withdrawalRequests || 0), icon: AlertTriangle, color: "red" },
    { title: "Today's Total Bet", value: fmt(betStats?.totalBet || 0), icon: TrendingUp, color: "blue" },
    { title: "Today's Total Win", value: fmt(betStats?.totalWin || 0), icon: Trophy, color: "green" },
    { title: "Today's Profit", value: fmt(betStats?.profit || 0), icon: Percent, color: "green" },
  ];

  return (
    <div>
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-8"
      >
        <h1 className="text-2xl font-bold text-foreground font-display tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">Real-time platform overview and analytics</p>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 lg:gap-4 mb-8"
      >
        {cards.map((card) => {
          const c = colorMap[card.color];
          return (
            <motion.div
              key={card.title}
              variants={cardAnim}
              whileHover={{ scale: 1.03, y: -2 }}
              className="rounded-2xl p-4 lg:p-5 relative overflow-hidden cursor-default group"
              style={{
                background: c.gradient,
                border: '1px solid hsl(225, 15%, 14%)',
                boxShadow: `0 0 30px ${c.glow}`,
              }}
            >
              {/* Subtle corner glow */}
              <div
                className="absolute -top-10 -right-10 w-24 h-24 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{ background: c.iconColor }}
              />

              <div className="relative z-10">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.1em] font-display leading-tight">
                    {card.title}
                  </p>
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center"
                    style={{ background: c.iconBg }}
                  >
                    <card.icon className="w-4 h-4" style={{ color: c.iconColor }} />
                  </div>
                </div>
                <p className="text-xl lg:text-2xl font-bold text-white font-display tracking-tight">
                  {card.value}
                </p>
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Game Settings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="glass-card-solid rounded-2xl p-6 lg:p-8"
      >
        <div className="flex items-center gap-3 mb-6">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{
              background: 'hsl(160, 84%, 39% / 0.12)',
              border: '1px solid hsl(160, 84%, 39% / 0.15)',
            }}
          >
            <Settings className="w-5 h-5" style={{ color: 'hsl(160, 84%, 45%)' }} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white font-display">Game Settings</h3>
            <p className="text-[11px] text-muted-foreground">Configure game modes and processing</p>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-5 mb-6">
          <div>
            <label className="block text-[10px] font-bold text-muted-foreground mb-2.5 uppercase tracking-[0.1em] font-display">
              Game Mode
            </label>
            <select
              value={currentMode}
              onChange={(e) => setGameMode(e.target.value)}
              className="select-dark w-full h-12"
            >
              <option value="wingo">WinGo</option>
              <option value="k3">K3</option>
              <option value="5d">5D</option>
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-bold text-muted-foreground mb-2.5 uppercase tracking-[0.1em] font-display">
              Process Type
            </label>
            <select
              value={currentProcess}
              onChange={(e) => setProcessType(e.target.value)}
              className="select-dark w-full h-12"
            >
              <option value="highest_bet_wins">Higher Bet Wins</option>
              <option value="random">Random</option>
              <option value="default">Higher Bet Lose</option>
            </select>
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => settingsMutation.mutate()}
          disabled={settingsMutation.isPending}
          className="btn-neon inline-flex items-center gap-2.5 px-6 py-3 text-[13px] font-display disabled:opacity-50 login-shimmer-btn"
          style={{
            background: 'linear-gradient(135deg, hsl(160, 84%, 39%), hsl(160, 70%, 32%), hsl(160, 84%, 39%))',
            backgroundSize: '200% 100%',
          }}
        >
          <Save className="w-4 h-4" />
          {settingsMutation.isPending ? "Saving..." : "Save Settings"}
        </motion.button>
      </motion.div>
    </div>
  );
}
