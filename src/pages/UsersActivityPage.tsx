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

  return (
    <div>
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <h1 className="text-2xl font-bold text-foreground font-display tracking-tight">Users Activity</h1>
        <p className="text-sm text-muted-foreground mt-1">View complete activity log of any user</p>
      </motion.div>

      <div className="glass-card-solid rounded-2xl p-6 mb-6">
        <div className="flex gap-3">
          <input value={userId} onChange={(e) => setUserId(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder="Enter User ID or Mobile..." className="input-dark flex-1 h-12 px-4 rounded-xl text-sm" />
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleSearch}
            className="btn-neon px-6 h-12 rounded-xl inline-flex items-center gap-2 text-sm font-display"
            style={{ background: 'linear-gradient(135deg, hsl(220, 90%, 56%), hsl(220, 80%, 48%))' }}>
            <Search className="w-4 h-4" /> Search
          </motion.button>
        </div>
      </div>

      {isLoading && <div className="flex justify-center py-20"><div className="w-8 h-8 border-3 border-primary/30 border-t-primary rounded-full animate-spin" /></div>}
      {isError && <p className="text-center text-destructive py-10">User not found or error occurred.</p>}

      {data && (
        <>
          {/* User Summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            {[
              { label: "Total Bets", value: data.betStats?.totalBetCount || 0, icon: Gamepad2, color: "hsl(220, 90%, 56%)" },
              { label: "Total Bet Amt", value: fmt(data.betStats?.totalBetAmount || 0), icon: TrendingUp, color: "hsl(38, 92%, 58%)" },
              { label: "Total Win Amt", value: fmt(data.betStats?.totalWinAmount || 0), icon: TrendingUp, color: "hsl(170, 80%, 50%)" },
              { label: "Profit/Loss", value: fmt((data.betStats?.totalBetAmount || 0) - (data.betStats?.totalWinAmount || 0)), icon: TrendingUp, color: "hsl(0, 72%, 60%)" },
            ].map((c) => (
              <div key={c.label} className="glass-card-solid rounded-2xl p-4">
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground font-display">{c.label}</p>
                <p className="text-lg font-bold text-foreground font-display mt-1">{c.value}</p>
              </div>
            ))}
          </div>

          {/* Recent Deposits */}
          <div className="glass-card-solid rounded-2xl overflow-hidden mb-4">
            <div className="p-4 border-b border-border flex items-center gap-2">
              <ArrowDownToLine className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-bold text-foreground font-display">Recent Deposits ({data.deposits?.length || 0})</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b border-border">
                  <th className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground font-display">ID</th>
                  <th className="text-right px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground font-display">Amount</th>
                  <th className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground font-display">UTR</th>
                  <th className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground font-display">Status</th>
                  <th className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground font-display">Date</th>
                </tr></thead>
                <tbody>
                  {(data.deposits || []).map((d: any) => (
                    <tr key={d.id} className="border-b border-border/50 hover:bg-secondary/30">
                      <td className="px-4 py-3 font-mono text-xs">{d.id}</td>
                      <td className="px-4 py-3 text-right font-bold font-display">{fmt(d.amount)}</td>
                      <td className="px-4 py-3 text-xs">{d.utr || "—"}</td>
                      <td className="px-4 py-3"><span className={`text-xs px-2 py-0.5 rounded-full ${d.status === "approved" ? "bg-emerald-500/20 text-emerald-400" : d.status === "rejected" ? "bg-destructive/20 text-destructive" : "bg-orange-500/20 text-orange-400"}`}>{d.status}</span></td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">{d.created_at?.split(" ")[0] || "—"}</td>
                    </tr>
                  ))}
                  {(!data.deposits || data.deposits.length === 0) && <tr><td colSpan={5} className="text-center py-6 text-muted-foreground">No deposits</td></tr>}
                </tbody>
              </table>
            </div>
          </div>

          {/* Recent Withdrawals */}
          <div className="glass-card-solid rounded-2xl overflow-hidden mb-4">
            <div className="p-4 border-b border-border flex items-center gap-2">
              <ArrowUpFromLine className="w-4 h-4 text-orange-400" />
              <h3 className="text-sm font-bold text-foreground font-display">Recent Withdrawals ({data.withdrawals?.length || 0})</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b border-border">
                  <th className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground font-display">ID</th>
                  <th className="text-right px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground font-display">Amount</th>
                  <th className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground font-display">Status</th>
                  <th className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground font-display">Date</th>
                </tr></thead>
                <tbody>
                  {(data.withdrawals || []).map((w: any) => (
                    <tr key={w.id} className="border-b border-border/50 hover:bg-secondary/30">
                      <td className="px-4 py-3 font-mono text-xs">{w.id}</td>
                      <td className="px-4 py-3 text-right font-bold font-display">{fmt(w.amount)}</td>
                      <td className="px-4 py-3"><span className={`text-xs px-2 py-0.5 rounded-full ${w.status === "approved" ? "bg-emerald-500/20 text-emerald-400" : w.status === "rejected" ? "bg-destructive/20 text-destructive" : "bg-orange-500/20 text-orange-400"}`}>{w.status}</span></td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">{w.created_at?.split(" ")[0] || "—"}</td>
                    </tr>
                  ))}
                  {(!data.withdrawals || data.withdrawals.length === 0) && <tr><td colSpan={4} className="text-center py-6 text-muted-foreground">No withdrawals</td></tr>}
                </tbody>
              </table>
            </div>
          </div>

          {/* Recent Bets */}
          <div className="glass-card-solid rounded-2xl overflow-hidden">
            <div className="p-4 border-b border-border flex items-center gap-2">
              <Gamepad2 className="w-4 h-4 text-primary" />
              <h3 className="text-sm font-bold text-foreground font-display">Recent Bets ({data.recentBets?.length || 0})</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b border-border">
                  <th className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground font-display">Game</th>
                  <th className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground font-display">Period</th>
                  <th className="text-right px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground font-display">Bet</th>
                  <th className="text-right px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground font-display">Win</th>
                  <th className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground font-display">Result</th>
                  <th className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground font-display">Date</th>
                </tr></thead>
                <tbody>
                  {(data.recentBets || []).map((b: any, i: number) => (
                    <tr key={i} className="border-b border-border/50 hover:bg-secondary/30">
                      <td className="px-4 py-3 text-xs">{b.game_name}</td>
                      <td className="px-4 py-3 font-mono text-xs">{b.period_id}</td>
                      <td className="px-4 py-3 text-right font-display font-bold">{fmt(b.bet_amount)}</td>
                      <td className="px-4 py-3 text-right font-display font-bold text-emerald-400">{fmt(b.win_amount)}</td>
                      <td className="px-4 py-3"><span className={`text-xs ${b.result === "gagner" ? "text-emerald-400" : "text-destructive"}`}>{b.result === "gagner" ? "Won" : "Lost"}</span></td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">{b.date?.split(" ")[0] || "—"}</td>
                    </tr>
                  ))}
                  {(!data.recentBets || data.recentBets.length === 0) && <tr><td colSpan={6} className="text-center py-6 text-muted-foreground">No bets found</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
