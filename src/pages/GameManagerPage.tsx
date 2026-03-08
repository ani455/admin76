import { useLocation } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { remoteDb } from "@/lib/remoteDb";
import { Gamepad2, Dice3, Dice5, Loader2, Target, Save, RotateCcw, Zap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { toast } from "sonner";

const COLORS_WINGO = [
  { label: "Red", value: "Red", bg: "hsl(0, 72%, 50%)", glow: "hsl(0, 72%, 50% / 0.3)" },
  { label: "Green", value: "Green", bg: "hsl(142, 71%, 45%)", glow: "hsl(142, 71%, 45% / 0.3)" },
  { label: "Violet", value: "Violet", bg: "hsl(270, 60%, 55%)", glow: "hsl(270, 60%, 55% / 0.3)" },
];

const NUMBERS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

export default function GameManagerPage() {
  const location = useLocation();
  const queryClient = useQueryClient();
  const path = location.pathname;

  let gameType = "WinGo";
  let gameTypeDb = "wingo";
  let GameIcon: React.ElementType = Gamepad2;
  let iconGradient = "linear-gradient(135deg, hsl(220, 90%, 56%), hsl(250, 80%, 55%))";
  if (path.includes("/k3")) { gameType = "K3"; gameTypeDb = "k3"; GameIcon = Dice3; iconGradient = "linear-gradient(135deg, hsl(38, 92%, 50%), hsl(25, 95%, 50%))"; }
  if (path.includes("/5d")) { gameType = "5D"; gameTypeDb = "5d"; GameIcon = Dice5; iconGradient = "linear-gradient(135deg, hsl(142, 71%, 45%), hsl(170, 80%, 45%))"; }

  const duration = path.split("/").pop() || "1min";

  // State for game control
  const [selectedNumber, setSelectedNumber] = useState<number | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);

  const { data: periods, isLoading } = useQuery({
    queryKey: ["game-periods", gameTypeDb, duration],
    queryFn: () => remoteDb("get_game_periods", { game_type: gameTypeDb, duration }),
  });

  const setResultMutation = useMutation({
    mutationFn: () => remoteDb("set_game_result", {
      game_type: gameTypeDb,
      duration,
      result_number: selectedNumber,
      result_color: selectedColor,
    }),
    onSuccess: () => {
      toast.success("Result set successfully!");
      queryClient.invalidateQueries({ queryKey: ["game-periods", gameTypeDb, duration] });
      setSelectedNumber(null);
      setSelectedColor(null);
    },
    onError: (e: any) => toast.error(e.message || "Failed to set result"),
  });

  const resetControl = () => {
    setSelectedNumber(null);
    setSelectedColor(null);
  };

  const getNumberColor = (n: number) => {
    if (n === 0 || n === 5) return "linear-gradient(135deg, hsl(270, 60%, 55%), hsl(300, 50%, 50%))";
    if (n % 2 === 0) return "linear-gradient(135deg, hsl(0, 72%, 50%), hsl(0, 60%, 40%))";
    return "linear-gradient(135deg, hsl(142, 71%, 45%), hsl(142, 60%, 35%))";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-xl flex items-center justify-center shadow-lg"
          style={{ background: iconGradient }}>
          <GameIcon className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-foreground font-display tracking-tight">{gameType} Manager</h2>
          <p className="text-xs text-muted-foreground font-medium">{duration} duration • Game control & history</p>
        </div>
      </motion.div>

      {/* Game Control Panel */}
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}
        className="glass-card-solid rounded-2xl p-5 lg:p-6">
        <div className="flex items-center gap-2.5 mb-5">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: 'hsl(var(--warning) / 0.12)', border: '1px solid hsl(var(--warning) / 0.2)' }}>
            <Target className="w-4 h-4" style={{ color: 'hsl(var(--warning))' }} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-foreground font-display">Set Next Result</h3>
            <p className="text-[11px] text-muted-foreground">Control the outcome of the next period</p>
          </div>
          <div className="ml-auto flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-warning" />
            <span className="text-[10px] font-bold text-warning uppercase tracking-wider">Live Control</span>
          </div>
        </div>

        {/* Number Selector */}
        <div className="mb-5">
          <label className="block text-[10px] font-bold text-muted-foreground mb-3 uppercase tracking-[0.1em] font-display">
            Select Number
          </label>
          <div className="flex flex-wrap gap-2">
            {NUMBERS.map((n) => (
              <motion.button key={n} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                onClick={() => setSelectedNumber(selectedNumber === n ? null : n)}
                className="relative w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold text-white transition-all duration-200"
                style={{
                  background: selectedNumber === n ? getNumberColor(n) : 'hsl(var(--muted))',
                  color: selectedNumber === n ? 'white' : 'hsl(var(--muted-foreground))',
                  boxShadow: selectedNumber === n ? `0 4px 15px ${n % 2 === 0 ? 'hsl(0, 72%, 50% / 0.3)' : 'hsl(142, 71%, 45% / 0.3)'}` : 'none',
                  border: selectedNumber === n ? 'none' : '1px solid hsl(var(--border))',
                }}>
                {n}
                {selectedNumber === n && (
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-white flex items-center justify-center shadow-md">
                    <span className="text-[8px] text-foreground">✓</span>
                  </motion.div>
                )}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Color Selector */}
        {gameTypeDb === "wingo" && (
          <div className="mb-5">
            <label className="block text-[10px] font-bold text-muted-foreground mb-3 uppercase tracking-[0.1em] font-display">
              Select Color
            </label>
            <div className="flex gap-2.5">
              {COLORS_WINGO.map((c) => (
                <motion.button key={c.value} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedColor(selectedColor === c.value ? null : c.value)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-200"
                  style={{
                    background: selectedColor === c.value ? c.bg : 'hsl(var(--muted))',
                    color: selectedColor === c.value ? 'white' : 'hsl(var(--muted-foreground))',
                    boxShadow: selectedColor === c.value ? `0 4px 15px ${c.glow}` : 'none',
                    border: selectedColor === c.value ? 'none' : '1px solid hsl(var(--border))',
                  }}>
                  <span className="w-3 h-3 rounded-full" style={{ background: c.bg, opacity: selectedColor === c.value ? 1 : 0.5 }} />
                  {c.label}
                </motion.button>
              ))}
            </div>
          </div>
        )}

        {/* Selected preview */}
        <AnimatePresence>
          {(selectedNumber !== null || selectedColor) && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
              className="mb-5 p-3 rounded-xl"
              style={{ background: 'hsl(var(--primary) / 0.06)', border: '1px solid hsl(var(--primary) / 0.15)' }}>
              <p className="text-xs text-muted-foreground mb-1">Next result preview:</p>
              <div className="flex items-center gap-3">
                {selectedNumber !== null && (
                  <span className="inline-flex w-8 h-8 rounded-lg items-center justify-center text-sm font-bold text-white"
                    style={{ background: getNumberColor(selectedNumber) }}>
                    {selectedNumber}
                  </span>
                )}
                {selectedColor && (
                  <span className={selectedColor === "Red" ? "badge-danger" : selectedColor === "Green" ? "badge-success" : "badge-info"}>
                    {selectedColor}
                  </span>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            onClick={() => setResultMutation.mutate()}
            disabled={setResultMutation.isPending || (selectedNumber === null && !selectedColor)}
            className="btn-neon inline-flex items-center gap-2 px-5 py-2.5 text-[13px] font-display disabled:opacity-40">
            <Save className="w-4 h-4" />
            {setResultMutation.isPending ? "Setting..." : "Set Result"}
          </motion.button>
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            onClick={resetControl}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-[13px] font-display font-medium rounded-xl transition-all"
            style={{ background: 'hsl(var(--muted))', color: 'hsl(var(--muted-foreground))', border: '1px solid hsl(var(--border))' }}>
            <RotateCcw className="w-3.5 h-3.5" />
            Reset
          </motion.button>
        </div>
      </motion.div>

      {/* Period History */}
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
        className="glass-table rounded-2xl overflow-hidden">
        <div className="px-5 py-4 flex items-center gap-2.5"
          style={{ borderBottom: '1px solid hsl(var(--border))' }}>
          <h3 className="text-sm font-bold text-foreground font-display">Period History</h3>
          <span className="text-[10px] font-medium px-2 py-0.5 rounded-full"
            style={{ background: 'hsl(var(--primary) / 0.1)', color: 'hsl(var(--primary))' }}>
            Last 50
          </span>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20"><Loader2 className="w-5 h-5 animate-spin text-primary" /></div>
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
                {periods.map((p: any, i: number) => (
                  <motion.tr key={p.id || i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}>
                    <td className="font-mono font-semibold text-foreground">{p.period_number}</td>
                    <td className="text-center">
                      <span className="inline-flex w-7 h-7 rounded-lg items-center justify-center text-[11px] font-bold text-white"
                        style={{ background: getNumberColor(p.result_number ?? 0) }}>
                        {p.result_number ?? "—"}
                      </span>
                    </td>
                    <td className="text-center">
                      {p.result_color && (
                        <span className={
                          p.result_color === "Red" ? "badge-danger" :
                          p.result_color === "Green" ? "badge-success" : "badge-info"
                        }>{p.result_color}</span>
                      )}
                    </td>
                    <td className="text-center text-muted-foreground">{p.big_small || "—"}</td>
                    <td className="text-right font-semibold text-foreground">₹{Number(p.total_bet).toLocaleString("en-IN")}</td>
                    <td className="text-right font-medium" style={{ color: 'hsl(var(--warning))' }}>₹{Number(p.total_win).toLocaleString("en-IN")}</td>
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
