import { useParams, useLocation } from "react-router-dom";
import { Gamepad2, Dice3, Dice5, Clock, Hash, Trophy, TrendingUp, BarChart3 } from "lucide-react";

const mockPeriods = Array.from({ length: 15 }, (_, i) => {
  const num = Math.floor(Math.random() * 10);
  const colors = ["Red", "Green", "Green", "Red", "Green", "Red", "Red", "Green", "Red", "Green"];
  return {
    period: `2026030800${String(100 - i).padStart(3, "0")}`,
    number: num,
    color: colors[num],
    bigSmall: num >= 5 ? "Big" : "Small",
    totalBet: Math.floor(Math.random() * 500000),
    totalWin: Math.floor(Math.random() * 300000),
    users: Math.floor(Math.random() * 200) + 10,
  };
});

export default function GameManagerPage() {
  const location = useLocation();
  const path = location.pathname;

  let gameType = "WinGo";
  let GameIcon: React.ElementType = Gamepad2;
  if (path.includes("/k3")) { gameType = "K3"; GameIcon = Dice3; }
  if (path.includes("/5d")) { gameType = "5D"; GameIcon = Dice5; }

  const duration = path.split("/").pop() || "1min";

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

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total Periods", value: "842", icon: Hash, color: "blue" },
          { label: "Active Users", value: "1,247", icon: TrendingUp, color: "green" },
          { label: "Total Bet", value: "₹12.5L", icon: BarChart3, color: "purple" },
          { label: "Profit", value: "₹2.4L", icon: Trophy, color: "orange" },
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

      {/* Period Table */}
      <div className="bg-card rounded-xl border overflow-hidden">
        <div className="px-4 py-3 border-b flex items-center gap-2">
          <Clock className="w-4 h-4 text-muted-foreground" />
          <h3 className="text-sm font-semibold text-card-foreground">Recent Periods</h3>
        </div>
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
              {mockPeriods.map((p, idx) => (
                <tr key={p.period} className="border-b last:border-0 hover:bg-secondary/30 transition-colors animate-fade-in" style={{ animationDelay: `${idx * 30}ms` }}>
                  <td className="px-4 py-3 font-mono text-xs text-card-foreground font-medium">{p.period}</td>
                  <td className="px-4 py-3 text-center">
                    <span className="inline-flex w-8 h-8 rounded-full items-center justify-center font-bold text-primary-foreground"
                      style={{ background: p.color === "Red" ? "hsl(var(--stat-red))" : "hsl(var(--stat-green))" }}>
                      {p.number}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold"
                      style={{
                        background: p.color === "Red" ? "hsl(var(--stat-red) / 0.1)" : "hsl(var(--stat-green) / 0.1)",
                        color: p.color === "Red" ? "hsl(var(--stat-red))" : "hsl(var(--stat-green))",
                      }}>
                      {p.color}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center text-xs font-medium text-muted-foreground">{p.bigSmall}</td>
                  <td className="px-4 py-3 text-right font-semibold text-card-foreground">₹{p.totalBet.toLocaleString("en-IN")}</td>
                  <td className="px-4 py-3 text-right" style={{ color: "hsl(var(--stat-orange))" }}>₹{p.totalWin.toLocaleString("en-IN")}</td>
                  <td className="px-4 py-3 text-center text-muted-foreground">{p.users}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
