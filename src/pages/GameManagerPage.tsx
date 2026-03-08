import { useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Gamepad2, Dice3, Dice5, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

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
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3 mb-6"
      >
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{
          background: 'hsl(var(--primary) / 0.12)',
          border: '1px solid hsl(var(--primary) / 0.15)',
        }}>
          <GameIcon className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-foreground font-display">{gameType} Manager</h2>
          <p className="text-[11px] text-muted-foreground font-medium">{duration} duration periods</p>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-table rounded-2xl overflow-hidden"
      >
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-5 h-5 animate-spin text-primary" />
          </div>
        ) : !periods?.length ? (
          <div className="text-center py-20 text-muted-foreground text-sm">No periods yet</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="admin-table">
              <thead>
                <tr>
                  <th className="text-left">Period</th>
                  <th className="text-center">Number</th>
                  <th className="text-center">Color</th>
                  <th className="text-center">Big/Small</th>
                  <th className="text-right">Total Bet</th>
                  <th className="text-right">Total Win</th>
                  <th className="text-center">Users</th>
                </tr>
              </thead>
              <tbody>
                {periods.map((p, i) => (
                  <motion.tr
                    key={p.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.02 }}
                  >
                    <td className="font-mono font-semibold text-white">{p.period_number}</td>
                    <td className="text-center">
                      <span
                        className="inline-flex w-7 h-7 rounded-lg items-center justify-center text-[11px] font-bold text-white"
                        style={{
                          background: p.result_color === "Red"
                            ? 'linear-gradient(135deg, hsl(0, 72%, 50%), hsl(0, 60%, 40%))'
                            : 'linear-gradient(135deg, hsl(142, 71%, 45%), hsl(142, 60%, 35%))',
                          boxShadow: p.result_color === "Red"
                            ? '0 2px 10px hsl(0, 72%, 50% / 0.3)'
                            : '0 2px 10px hsl(142, 71%, 45% / 0.3)',
                        }}
                      >
                        {p.result_number ?? "—"}
                      </span>
                    </td>
                    <td className="text-center">
                      {p.result_color && (
                        <span className={p.result_color === "Red" ? "badge-danger" : "badge-success"}>
                          {p.result_color}
                        </span>
                      )}
                    </td>
                    <td className="text-center text-muted-foreground">{p.big_small || "—"}</td>
                    <td className="text-right font-semibold text-white">₹{Number(p.total_bet).toLocaleString("en-IN")}</td>
                    <td className="text-right font-medium" style={{ color: 'hsl(38, 92%, 55%)' }}>₹{Number(p.total_win).toLocaleString("en-IN")}</td>
                    <td className="text-center text-muted-foreground">{p.users_count}</td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </div>
  );
}
