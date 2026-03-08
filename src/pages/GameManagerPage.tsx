import { useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Gamepad2, Dice3, Dice5, Loader2 } from "lucide-react";

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
        .limit(50);
      if (error) throw error;
      return data || [];
    },
  });

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <GameIcon className="w-5 h-5 text-primary" />
        <h2 className="text-lg font-bold text-foreground">{gameType} Manager — {duration}</h2>
      </div>

      <div className="bg-card rounded-lg border overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-5 h-5 animate-spin text-primary" />
          </div>
        ) : !periods?.length ? (
          <div className="text-center py-16 text-muted-foreground text-sm">No periods yet</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b bg-muted/30">
                  <th className="text-left px-3 py-2 font-semibold text-muted-foreground">Period</th>
                  <th className="text-center px-3 py-2 font-semibold text-muted-foreground">Number</th>
                  <th className="text-center px-3 py-2 font-semibold text-muted-foreground">Color</th>
                  <th className="text-center px-3 py-2 font-semibold text-muted-foreground">Big/Small</th>
                  <th className="text-right px-3 py-2 font-semibold text-muted-foreground">Total Bet</th>
                  <th className="text-right px-3 py-2 font-semibold text-muted-foreground">Total Win</th>
                  <th className="text-center px-3 py-2 font-semibold text-muted-foreground">Users</th>
                </tr>
              </thead>
              <tbody>
                {periods.map((p) => (
                  <tr key={p.id} className="border-b last:border-0 table-row-hover">
                    <td className="px-3 py-2 font-mono font-medium">{p.period_number}</td>
                    <td className="px-3 py-2 text-center">
                      <span
                        className="inline-flex w-6 h-6 rounded-full items-center justify-center text-[11px] font-bold text-white"
                        style={{ backgroundColor: p.result_color === "Red" ? "#ef4444" : "#22c55e" }}
                      >
                        {p.result_number ?? "—"}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-center">
                      {p.result_color && (
                        <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold ${
                          p.result_color === "Red" ? "bg-destructive/10 text-destructive" : "bg-success/10 text-success"
                        }`}>
                          {p.result_color}
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-2 text-center text-muted-foreground">{p.big_small || "—"}</td>
                    <td className="px-3 py-2 text-right font-semibold">₹{Number(p.total_bet).toLocaleString("en-IN")}</td>
                    <td className="px-3 py-2 text-right text-warning font-medium">₹{Number(p.total_win).toLocaleString("en-IN")}</td>
                    <td className="px-3 py-2 text-center text-muted-foreground">{p.users_count}</td>
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