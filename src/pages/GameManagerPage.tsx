import { useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Gamepad2, Dice3, Dice5, Clock, Hash, Trophy, TrendingUp, BarChart3, Loader2 } from "lucide-react";

export default function GameManagerPage() {
  const location = useLocation();
  const path = location.pathname;

  let gameType = "WinGo";
  let gameTypeDb = "wingo";
  let GameIcon: React.ElementType = Gamepad2;
  if (path.includes("/k3")) { gameType = "K3"; gameTypeDb = "k3"; GameIcon = Dice3; }
  if (path.includes("/5d")) { gameType = "5D"; gameTypeDb = "5d"; GameIcon = Dice5; }

  const duration = path.split("/").pop() || "1min";

  const { data: periods, isLoading } = useQuery({
    queryKey: ["game-periods", gameTypeDb, duration],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("game_periods")
        .select("*")
        .eq("game_type", gameTypeDb)
        .eq("duration", duration)
        .order("created_at", { ascending: false })
        .limit(20);
      if (error) throw error;
      return data || [];
    },
  });

  const { data: stats } = useQuery({
    queryKey: ["game-stats", gameTypeDb, duration],
    queryFn: async () => {
      const { count } = await supabase.from("game_periods").select("*", { count: "exact", head: true }).eq("game_type", gameTypeDb).eq("duration", duration);
      const { data: periods } = await supabase.from("game_periods").select("total_bet, total_win, users_count").eq("game_type", gameTypeDb).eq("duration", duration);
      const totalBet = periods?.reduce((s, p) => s + Number(p.total_bet), 0) || 0;
      const totalWin = periods?.reduce((s, p) => s + Number(p.total_win), 0) || 0;
      const activeUsers = periods?.reduce((s, p) => s + (p.users_count || 0), 0) || 0;
      return { totalPeriods: count || 0, activeUsers, totalBet, profit: totalBet - totalWin };
    },
  });

  const fmt = (n: number) => {
    if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`;
    if (n >= 1000) return `₹${(n / 1000).toFixed(1)}K`;
    return `₹${n}`;
  };

  return (
    <div className="animate-fade-in">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: "hsl(var(--stat-indigo) / 0.1)" }}>
          <GameIcon className="w-6 h-6" style={{ color: "hsl(var(--stat-indigo))" }} />
        </div>
        <div>
          <h2 className="text-2xl font-extrabold text-foreground">{gameType} Manager</h2>
          <p className="text-sm text-muted-foreground">Duration: {duration}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total Periods", value: (stats?.totalPeriods || 0).toLocaleString(), icon: Hash, color: "blue" },
          { label: "Active Users", value: (stats?.activeUsers || 0).toLocaleString(), icon: TrendingUp, color: "green" },
          { label: "Total Bet", value: fmt(stats?.totalBet || 0), icon: BarChart3, color: "purple" },
          { label: "Profit", value: fmt(stats?.profit || 0), icon: Trophy, color: "orange" },
        ].map((s, idx) => (
          <div key={s.label} className="bg-card rounded-xl border p-4 flex items-center gap-3 animate-slide-up" style={{ animationDelay: `${idx * 80}ms` }}>
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: `hsl(var(--stat-${s.color}) / 0.1)` }}>
              <s.icon className="w-5 h-5" style={{ color: `hsl(var(--stat-${s.color}))` }} />
            </div>
            <div>
              <p className="text-xl font-extrabold text-card-foreground">{s.value}</p>
              <p className="text-xs text-muted-foreground font-medium">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-card rounded-xl border overflow-hidden">
        <div className="px-4 py-3 border-b flex items-center gap-2">
          <Clock className="w-4 h-4 text-muted-foreground" />
          <h3 className="text-sm font-semibold text-card-foreground">Recent Periods</h3>
        </div>
        {isLoading ? (
          <div className="flex items-center justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
        ) : !periods || periods.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            <p className="text-lg font-semibold">No periods yet</p>
            <p className="text-sm mt-1">Game periods will appear here as games run</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-secondary/50">
                  <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Period</th>
                  <th className="text-center px-4 py-3 font-semibold text-muted-foreground">Number</th>
                  <th className="text-center px-4 py-3 font-semibold text-muted-foreground">Color</th>
                  <th className="text-center px-4 py-3 font-semibold text-muted-foreground">Big/Small</th>
                  <th className="text-right px-4 py-3 font-semibold text-muted-foreground">Total Bet</th>
                  <th className="text-right px-4 py-3 font-semibold text-muted-foreground">Total Win</th>
                  <th className="text-center px-4 py-3 font-semibold text-muted-foreground">Users</th>
                </tr>
              </thead>
              <tbody>
                {periods.map((p, idx) => (
                  <tr key={p.id} className="border-b last:border-0 hover:bg-secondary/30 transition-colors animate-fade-in" style={{ animationDelay: `${idx * 30}ms` }}>
                    <td className="px-4 py-3 font-mono text-xs text-card-foreground font-medium">{p.period_number}</td>
                    <td className="px-4 py-3 text-center">
                      <span className="inline-flex w-8 h-8 rounded-full items-center justify-center font-bold text-primary-foreground" style={{ background: p.result_color === "Red" ? "hsl(var(--stat-red))" : "hsl(var(--stat-green))" }}>
                        {p.result_number ?? "—"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      {p.result_color && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold" style={{
                          background: p.result_color === "Red" ? "hsl(var(--stat-red) / 0.1)" : "hsl(var(--stat-green) / 0.1)",
                          color: p.result_color === "Red" ? "hsl(var(--stat-red))" : "hsl(var(--stat-green))",
                        }}>{p.result_color}</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center text-xs font-medium text-muted-foreground">{p.big_small || "—"}</td>
                    <td className="px-4 py-3 text-right font-semibold text-card-foreground">₹{Number(p.total_bet).toLocaleString("en-IN")}</td>
                    <td className="px-4 py-3 text-right" style={{ color: "hsl(var(--stat-orange))" }}>₹{Number(p.total_win).toLocaleString("en-IN")}</td>
                    <td className="px-4 py-3 text-center text-muted-foreground">{p.users_count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
