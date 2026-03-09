import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { remoteDb } from "@/lib/remoteDb";
import { ScrollText, Search, TrendingUp, ArrowDownToLine, ArrowUpFromLine, Gamepad2 } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

export default function UsersActivityPage() {
  const [userId, setUserId] = useState("");
  const [searchId, setSearchId] = useState("");

  const { data, isLoading, isError } = useQuery({
    queryKey: ["user-activity", searchId],
    queryFn: () => remoteDb("get_user_activity", { userId: searchId }),
    enabled: !!searchId,
  });

  const handleSearch = () => {
    if (!userId.trim()) { toast.error("Enter User ID or Mobile"); return; }
    setSearchId(userId.trim());
  };

  const fmt = (n: number) => `₹${Number(n || 0).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <motion.div initial="hidden" animate="show" variants={containerVariants}>
      <motion.div variants={itemVariants} className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground font-display tracking-tight">Users Activity</h1>
        <p className="text-sm text-muted-foreground mt-1">View complete activity log of any user</p>
      </motion.div>

      <motion.div variants={itemVariants} className="glass-card-solid rounded-2xl p-6 mb-6 shadow-sm border-border/50">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input value={userId} onChange={(e) => setUserId(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder="Enter User ID or Mobile..." className="search-input w-full h-12 pl-10 pr-4" />
          </div>
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleSearch}
            className="btn-neon px-8 h-12 rounded-xl inline-flex items-center justify-center gap-2 text-sm font-display whitespace-nowrap"
            style={{ background: 'linear-gradient(135deg, hsl(220, 90%, 56%), hsl(220, 80%, 48%))' }}>
            Fetch Activity Log
          </motion.button>
        </div>
      </motion.div>

      {isLoading && <div className="flex justify-center py-20"><div className="w-8 h-8 border-3 border-primary/30 border-t-primary rounded-full animate-spin" /></div>}
      {isError && (
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-10 bg-destructive/10 rounded-2xl border border-destructive/20">
          <p className="text-destructive font-medium">User not found or error occurred.</p>
        </motion.div>
      )}

      {data && (
        <>
          {/* User Summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {[
              { label: "Total Bets", value: data.betStats?.totalBetCount || 0, icon: Gamepad2, color: "hsl(220, 90%, 56%)", bg: "hsl(220, 90%, 56% / 0.1)" },
              { label: "Total Bet Amount", value: fmt(data.betStats?.totalBetAmount || 0), icon: TrendingUp, color: "hsl(38, 92%, 50%)", bg: "hsl(38, 92%, 50% / 0.1)" },
              { label: "Total Win Amount", value: fmt(data.betStats?.totalWinAmount || 0), icon: TrendingUp, color: "hsl(160, 80%, 45%)", bg: "hsl(160, 80%, 45% / 0.1)" },
              { label: "Net Profit/Loss", value: fmt((data.betStats?.totalWinAmount || 0) - (data.betStats?.totalBetAmount || 0)), icon: TrendingUp, color: (data.betStats?.totalWinAmount || 0) - (data.betStats?.totalBetAmount || 0) >= 0 ? "hsl(160, 80%, 45%)" : "hsl(0, 72%, 60%)", bg: (data.betStats?.totalWinAmount || 0) - (data.betStats?.totalBetAmount || 0) >= 0 ? "hsl(160, 80%, 45% / 0.1)" : "hsl(0, 72%, 60% / 0.1)" },
            ].map((c, i) => (
              <motion.div variants={itemVariants} key={c.label} className="glass-card-solid rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow duration-300 relative overflow-hidden group border-border/50">
                <div className="absolute -right-4 -top-4 w-16 h-16 rounded-full blur-xl opacity-50 group-hover:opacity-100 transition-opacity duration-300" style={{ background: c.color }} />
                <div className="flex items-start justify-between mb-4">
                  <div className="p-2.5 rounded-xl" style={{ background: c.bg, color: c.color }}>
                    <c.icon className="w-5 h-5" />
                  </div>
                </div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground font-display mb-1">{c.label}</p>
                <p className="text-2xl font-bold text-foreground font-display">{c.value}</p>
              </motion.div>
            ))}
          </div>

          {/* Recent Deposits */}
          <motion.div variants={itemVariants} className="glass-card-solid rounded-2xl overflow-hidden mb-6 shadow-sm border-border/50">
            <div className="p-5 border-b border-border/50 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-success/10 text-success">
                <ArrowDownToLine className="w-4 h-4" />
              </div>
              <h3 className="text-base font-bold text-foreground font-display">Recent Deposits <span className="text-muted-foreground font-normal ml-1">({data.deposits?.length || 0})</span></h3>
            </div>
            <div className="overflow-x-auto">
              <table className="admin-table">
                <thead><tr className="border-b border-border/50">
                  <th className="text-left">Deposit ID</th>
                  <th className="text-right">Amount</th>
                  <th className="text-left">UTR / Reference</th>
                  <th className="text-left">Status</th>
                  <th className="text-left">Date</th>
                </tr></thead>
                <tbody>
                  {(data.deposits || []).map((d: any, i: number) => (
                    <motion.tr initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} key={d.id} className="table-row-hover">
                      <td className="font-mono text-xs font-medium">{d.id}</td>
                      <td className="text-right font-bold font-display text-success">{fmt(d.amount)}</td>
                      <td className="text-xs font-mono">{d.utr || "—"}</td>
                      <td>
                        <span className={`text-[10px] uppercase tracking-wider font-bold px-2.5 py-1 rounded-full border ${d.status === "approved" ? "bg-success/10 text-success border-success/20" : d.status === "rejected" ? "bg-destructive/10 text-destructive border-destructive/20" : "bg-warning/10 text-warning border-warning/20"}`}>{d.status}</span>
                      </td>
                      <td className="text-xs text-muted-foreground">{d.created_at?.split(" ")[0] || "—"}</td>
                    </motion.tr>
                  ))}
                  {(!data.deposits || data.deposits.length === 0) && <tr><td colSpan={5} className="text-center py-10 text-muted-foreground">No deposit records found.</td></tr>}
                </tbody>
              </table>
            </div>
          </motion.div>

          {/* Recent Withdrawals */}
          <motion.div variants={itemVariants} className="glass-card-solid rounded-2xl overflow-hidden mb-6 shadow-sm border-border/50">
            <div className="p-5 border-b border-border/50 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-warning/10 text-warning">
                <ArrowUpFromLine className="w-4 h-4" />
              </div>
              <h3 className="text-base font-bold text-foreground font-display">Recent Withdrawals <span className="text-muted-foreground font-normal ml-1">({data.withdrawals?.length || 0})</span></h3>
            </div>
            <div className="overflow-x-auto">
              <table className="admin-table">
                <thead><tr className="border-b border-border/50">
                  <th className="text-left">Withdrawal ID</th>
                  <th className="text-right">Amount</th>
                  <th className="text-left">Status</th>
                  <th className="text-left">Date</th>
                </tr></thead>
                <tbody>
                  {(data.withdrawals || []).map((w: any, i: number) => (
                    <motion.tr initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} key={w.id} className="table-row-hover">
                      <td className="font-mono text-xs font-medium">{w.id}</td>
                      <td className="text-right font-bold font-display text-warning">{fmt(w.amount)}</td>
                      <td>
                        <span className={`text-[10px] uppercase tracking-wider font-bold px-2.5 py-1 rounded-full border ${w.status === "approved" ? "bg-success/10 text-success border-success/20" : w.status === "rejected" ? "bg-destructive/10 text-destructive border-destructive/20" : "bg-warning/10 text-warning border-warning/20"}`}>{w.status}</span>
                      </td>
                      <td className="text-xs text-muted-foreground">{w.created_at?.split(" ")[0] || "—"}</td>
                    </motion.tr>
                  ))}
                  {(!data.withdrawals || data.withdrawals.length === 0) && <tr><td colSpan={4} className="text-center py-10 text-muted-foreground">No withdrawal records found.</td></tr>}
                </tbody>
              </table>
            </div>
          </motion.div>

          {/* Recent Bets */}
          <motion.div variants={itemVariants} className="glass-card-solid rounded-2xl overflow-hidden shadow-sm border-border/50">
            <div className="p-5 border-b border-border/50 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-primary/10 text-primary">
                <Gamepad2 className="w-4 h-4" />
              </div>
              <h3 className="text-base font-bold text-foreground font-display">Recent Game Bets <span className="text-muted-foreground font-normal ml-1">({data.recentBets?.length || 0})</span></h3>
            </div>
            <div className="overflow-x-auto">
              <table className="admin-table">
                <thead><tr className="border-b border-border/50">
                  <th className="text-left">Game</th>
                  <th className="text-left">Period ID</th>
                  <th className="text-right">Bet Amount</th>
                  <th className="text-right">Win Amount</th>
                  <th className="text-left">Result</th>
                  <th className="text-left">Date</th>
                </tr></thead>
                <tbody>
                  {(data.recentBets || []).map((b: any, i: number) => (
                    <motion.tr initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} key={i} className="table-row-hover">
                      <td className="text-xs font-semibold">{b.game_name}</td>
                      <td className="font-mono text-xs text-muted-foreground">{b.period_id}</td>
                      <td className="text-right font-display font-bold">{fmt(b.bet_amount)}</td>
                      <td className="text-right font-display font-bold text-emerald-500">{fmt(b.win_amount)}</td>
                      <td>
                        <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded border ${b.result === "gagner" ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-destructive/10 text-destructive border-destructive/20"}`}>
                          {b.result === "gagner" ? "Won" : "Lost"}
                        </span>
                      </td>
                      <td className="text-xs text-muted-foreground">{b.date?.split(" ")[0] || "—"}</td>
                    </motion.tr>
                  ))}
                  {(!data.recentBets || data.recentBets.length === 0) && <tr><td colSpan={6} className="text-center py-10 text-muted-foreground">No betting history found.</td></tr>}
                </tbody>
              </table>
            </div>
          </motion.div>
        </>
      )}
    </motion.div>
  );
}
