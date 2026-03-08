import { useQuery } from "@tanstack/react-query";
import { remoteDb } from "@/lib/remoteDb";
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
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] as const } },
};

export default function Dashboard() {
  const queryClient = useQueryClient();
  const today = new Date();
  const todayStr = today.toISOString().split("T")[0];

  const { data: stats } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: () => remoteDb("dashboard_stats", { today: todayStr }),
  });

  const { data: settings } = useQuery({
    queryKey: ["game-settings"],
    queryFn: () => remoteDb("get_game_settings"),
  });

  const [gameMode, setGameMode] = useState("");
  const [processType, setProcessType] = useState("");
  const currentMode = gameMode || settings?.game_mode || "wingo";
  const currentProcess = processType || settings?.process_type || "highest_bet_wins";

  const settingsMutation = useMutation({
    mutationFn: () => remoteDb("update_game_settings", { game_mode: currentMode, process_type: currentProcess }),
    onSuccess: () => { toast.success("Settings saved successfully!"); queryClient.invalidateQueries({ queryKey: ["game-settings"] }); },
    onError: () => toast.error("Failed to save settings"),
  });

  const fmt = (n: number) => `₹${n.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;

  type CardColor = "blue" | "teal" | "orange" | "red";

  const colorMap: Record<CardColor, { iconColor: string; iconBg: string }> = {
    blue: {
      iconColor: 'hsl(220, 90%, 65%)',
      iconBg: 'hsl(220, 90%, 56% / 0.12)',
    },
    teal: {
      iconColor: 'hsl(170, 80%, 50%)',
      iconBg: 'hsl(170, 80%, 45% / 0.12)',
    },
    orange: {
      iconColor: 'hsl(38, 92%, 58%)',
      iconBg: 'hsl(38, 92%, 50% / 0.12)',
    },
    red: {
      iconColor: 'hsl(0, 72%, 60%)',
      iconBg: 'hsl(0, 72%, 51% / 0.12)',
    },
  };

  const cards: { title: string; value: string | number; icon: React.ElementType; color: CardColor }[] = [
    { title: "Today User Join", value: stats?.todayUsers || 0, icon: UserPlus, color: "blue" },
    { title: "Today's Recharge", value: fmt(stats?.todayRecharge || 0), icon: IndianRupee, color: "teal" },
    { title: "Today's Withdrawal", value: fmt(stats?.todayWithdraw || 0), icon: ArrowDownToLine, color: "orange" },
    { title: "User Balance", value: fmt(stats?.userBalance || 0), icon: Wallet, color: "blue" },
    { title: "Total Users", value: stats?.totalUsers || 0, icon: Users, color: "blue" },
    { title: "Pending Recharge", value: fmt(stats?.pendingRecharge || 0), icon: Clock, color: "orange" },
    { title: "Success Recharge", value: fmt(stats?.successRecharge || 0), icon: CheckCircle, color: "teal" },
    { title: "Total Withdrawal", value: fmt(stats?.totalWithdrawal || 0), icon: ArrowUpFromLine, color: "blue" },
    { title: "Withdrawal Requests", value: fmt(stats?.withdrawalRequests || 0), icon: AlertTriangle, color: "red" },
    { title: "Today's Total Bet", value: fmt(stats?.totalBet || 0), icon: TrendingUp, color: "blue" },
    { title: "Today's Total Win", value: fmt(stats?.totalWin || 0), icon: Trophy, color: "teal" },
    { title: "Today's Profit", value: fmt((stats?.totalBet || 0) - (stats?.totalWin || 0)), icon: Percent, color: "teal" },
  ];

  return (
    <div>
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="mb-8">
        <h1 className="text-2xl font-bold text-foreground font-display tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">Real-time platform overview and analytics</p>
      </motion.div>

      <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 lg:gap-4 mb-8">
        {cards.map((card) => {
          const c = colorMap[card.color];
          return (
            <motion.div key={card.title} variants={cardAnim} whileHover={{ scale: 1.03, y: -2 }}
              className="rounded-2xl p-4 lg:p-5 relative overflow-hidden cursor-default group glass-card-solid"
            >
              <div className="absolute -top-10 -right-10 w-24 h-24 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ background: c.iconColor }} />
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.1em] font-display leading-tight">{card.title}</p>
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: c.iconBg }}>
                    <card.icon className="w-4 h-4" style={{ color: c.iconColor }} />
                  </div>
                </div>
                <p className="text-xl lg:text-2xl font-bold text-foreground font-display tracking-tight">{card.value}</p>
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Game Settings */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }} className="glass-card-solid rounded-2xl p-6 lg:p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'hsl(var(--primary) / 0.12)', border: '1px solid hsl(var(--primary) / 0.15)' }}>
            <Settings className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-foreground font-display">Game Settings</h3>
            <p className="text-[11px] text-muted-foreground">Configure game modes and processing</p>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-5 mb-6">
          <div>
            <label className="block text-[10px] font-bold text-muted-foreground mb-2.5 uppercase tracking-[0.1em] font-display">Game Mode</label>
            <select value={currentMode} onChange={(e) => setGameMode(e.target.value)} className="select-dark w-full h-12">
              <option value="wingo">WinGo</option>
              <option value="k3">K3</option>
              <option value="5d">5D</option>
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-bold text-muted-foreground mb-2.5 uppercase tracking-[0.1em] font-display">Process Type</label>
            <select value={currentProcess} onChange={(e) => setProcessType(e.target.value)} className="select-dark w-full h-12">
              <option value="highest_bet_wins">Higher Bet Wins</option>
              <option value="random">Random</option>
              <option value="default">Higher Bet Lose</option>
            </select>
          </div>
        </div>

        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => settingsMutation.mutate()} disabled={settingsMutation.isPending}
          className="btn-neon inline-flex items-center gap-2.5 px-6 py-3 text-[13px] font-display disabled:opacity-50 login-shimmer-btn">
          <Save className="w-4 h-4" />
          {settingsMutation.isPending ? "Saving..." : "Save Settings"}
        </motion.button>
      </motion.div>
    </div>
  );
}
