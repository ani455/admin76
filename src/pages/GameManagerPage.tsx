import { useLocation } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { remoteDb } from "@/lib/remoteDb";
import { Gamepad2, Dice3, Dice5, Loader2, Target, RotateCcw, Zap, Timer, TrendingUp, Users } from "lucide-react";
import { motion } from "framer-motion";
import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";

const NUMBERS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

function getNumberColor(n: number) {
  if (n === 0 || n === 5) return "hsl(270, 60%, 55%)";
  if (n % 2 === 0) return "hsl(0, 72%, 50%)";
  return "hsl(142, 71%, 45%)";
}

function getNumberColorName(n: number) {
  if (n === 0 || n === 5) return "Violet";
  if (n % 2 === 0) return "Red";
  return "Green";
}

export default function GameManagerPage() {
  const location = useLocation();
  const queryClient = useQueryClient();
  const path = location.pathname;

  let gameType = "WinGo";
  let gameTypeDb = "wingo";
  let GameIcon: React.ElementType = Gamepad2;
  if (path.includes("/k3")) { gameType = "K3"; gameTypeDb = "k3"; GameIcon = Dice3; }
  if (path.includes("/5d")) { gameType = "5D"; gameTypeDb = "5d"; GameIcon = Dice5; }

  const duration = path.split("/").pop() || "1min";
  const durationSeconds = duration === "30sec" ? 30 : duration === "1min" ? 60 : duration === "3min" ? 180 : duration === "5min" ? 300 : 600;

  // State
  const [prediction, setPrediction] = useState("");
  const [countdown, setCountdown] = useState(0);

  // Countdown timer
  useEffect(() => {
    const tick = () => {
      const now = Math.floor(Date.now() / 1000);
      setCountdown(durationSeconds - (now % durationSeconds));
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [durationSeconds]);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  };

  // Queries
  const { data: periods, isLoading } = useQuery({
    queryKey: ["game-periods", gameTypeDb, duration],
    queryFn: () => remoteDb("get_game_periods", { game_type: gameTypeDb, duration }),
    refetchInterval: 5000,
  });

  const { data: liveBets, isLoading: liveBetsLoading } = useQuery({
    queryKey: ["live-bets", gameTypeDb, duration],
    queryFn: () => remoteDb("get_live_bets", { game_type: gameTypeDb, duration }),
    refetchInterval: 2000,
  });

  const { data: betSummary } = useQuery({
    queryKey: ["bet-summary", gameTypeDb, duration],
    queryFn: () => remoteDb("get_bet_summary", { game_type: gameTypeDb, duration }),
    refetchInterval: 2000,
  });

  const { data: currentPrediction } = useQuery({
    queryKey: ["current-prediction", gameTypeDb, duration],
    queryFn: () => remoteDb("get_current_prediction", { game_type: gameTypeDb, duration }),
    refetchInterval: 3000,
  });

  // Set prediction mutation
  const setPredictionMutation = useMutation({
    mutationFn: () => remoteDb("set_game_result", {
      game_type: gameTypeDb,
      duration,
      result_number: parseInt(prediction),
      result_color: getNumberColorName(parseInt(prediction)),
    }),
    onSuccess: () => {
      toast.success("Prediction set successfully!");
      queryClient.invalidateQueries({ queryKey: ["game-periods", gameTypeDb, duration] });
    },
    onError: (e: any) => toast.error(e.message || "Failed to set prediction"),
  });

  // Unset prediction
  const unsetMutation = useMutation({
    mutationFn: () => remoteDb("unset_game_result", { game_type: gameTypeDb, duration }),
    onSuccess: () => {
      toast.success("Prediction unset!");
      setPrediction("");
    },
    onError: (e: any) => toast.error(e.message || "Failed to unset"),
  });

  const handleConfirm = () => {
    const num = parseInt(prediction);
    if (isNaN(num) || num < 0 || num > 9) {
      toast.error("Enter a number from 0-9");
      return;
    }
    setPredictionMutation.mutate();
  };

  const totalBet = betSummary?.total_bet || 0;

  return (
    <div className="space-y-5">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-lg">
            <GameIcon className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground font-display">{gameType} {duration}</h2>
            <p className="text-xs text-muted-foreground">Game control & live monitoring</p>
          </div>
        </div>
      </motion.div>

      {/* Top Row: Countdown + Period ID + Total Bet */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
          className="glass-card-solid rounded-xl p-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-destructive/10 flex items-center justify-center">
            <Timer className="w-4 h-4 text-destructive" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Countdown</p>
            <p className="text-xl font-mono font-bold text-foreground">{formatTime(countdown)}</p>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="glass-card-solid rounded-xl p-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
            <Target className="w-4 h-4 text-primary" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Period ID</p>
            <p className="text-sm font-mono font-bold text-foreground">{periods?.[0]?.period_number || "—"}</p>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className="glass-card-solid rounded-xl p-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-warning/10 flex items-center justify-center">
            <TrendingUp className="w-4 h-4 text-warning" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Total Bet</p>
            <p className="text-lg font-bold text-foreground">₹{Number(totalBet).toLocaleString("en-IN")}</p>
          </div>
        </motion.div>
      </div>

      {/* Prediction Form */}
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}
        className="glass-card-solid rounded-xl p-5">
        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-8 h-8 rounded-lg bg-warning/10 flex items-center justify-center">
            <Zap className="w-4 h-4 text-warning" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-foreground font-display">Prediction Form</h3>
            <p className="text-[11px] text-muted-foreground">Set next result (0-9)</p>
          </div>
          <span className="ml-auto badge-warning text-[10px] font-bold uppercase tracking-wider px-2.5 py-1">Live</span>
        </div>

        {/* Number buttons */}
        <div className="flex flex-wrap gap-2 mb-4">
          {NUMBERS.map((n) => (
            <motion.button key={n} whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }}
              onClick={() => setPrediction(String(n))}
              className="w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold transition-all duration-200 border"
              style={{
                background: prediction === String(n) ? getNumberColor(n) : 'hsl(var(--muted))',
                color: prediction === String(n) ? 'white' : 'hsl(var(--foreground))',
                borderColor: prediction === String(n) ? getNumberColor(n) : 'hsl(var(--border))',
                boxShadow: prediction === String(n) ? `0 4px 12px ${getNumberColor(n)}40` : 'none',
              }}>
              {n}
            </motion.button>
          ))}
        </div>

        {/* Input + Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="number"
            min={0}
            max={9}
            value={prediction}
            onChange={(e) => setPrediction(e.target.value)}
            placeholder="Enter 0-9"
            className="search-input flex-1 !pl-4"
          />
          <div className="flex gap-2">
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              onClick={handleConfirm}
              disabled={setPredictionMutation.isPending || !prediction}
              className="btn-neon px-5 py-2.5 text-[13px] font-display disabled:opacity-40">
              {setPredictionMutation.isPending ? "Setting..." : "Confirm Prediction"}
            </motion.button>
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              onClick={() => unsetMutation.mutate()}
              disabled={unsetMutation.isPending}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-[13px] font-display font-medium rounded-xl bg-secondary text-secondary-foreground border border-border hover:bg-muted transition-all">
              <RotateCcw className="w-3.5 h-3.5" />
              Unset
            </motion.button>
          </div>
        </div>

        {/* Preview */}
        {prediction && !isNaN(parseInt(prediction)) && parseInt(prediction) >= 0 && parseInt(prediction) <= 9 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="mt-4 p-3 rounded-lg bg-primary/5 border border-primary/15 flex items-center gap-3">
            <span className="text-xs text-muted-foreground">Next prediction:</span>
            <span className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold text-white"
              style={{ background: getNumberColor(parseInt(prediction)) }}>
              {prediction}
            </span>
            <span className="text-xs font-semibold" style={{ color: getNumberColor(parseInt(prediction)) }}>
              {getNumberColorName(parseInt(prediction))}
            </span>
          </motion.div>
        )}
      </motion.div>

      {/* Bet Details Table */}
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        className="glass-table rounded-xl overflow-hidden">
        <div className="px-5 py-3.5 flex items-center gap-2.5 border-b border-border">
          <h3 className="text-sm font-bold text-foreground font-display">Bet Details</h3>
          <span className="badge-info">Current Period</span>
        </div>
        <div className="overflow-x-auto">
          <table className="admin-table">
            <thead>
              <tr>
                <th className="text-left">Result</th>
                <th className="text-center">Number</th>
                <th className="text-right">Bet Amount</th>
                <th className="text-center">No. of Users</th>
                <th className="text-right">Amount to Pay</th>
              </tr>
            </thead>
            <tbody>
              {betSummary?.details?.length ? betSummary.details.map((d: any, i: number) => (
                <tr key={i}>
                  <td>
                    <span className="w-3 h-3 rounded-full inline-block mr-2" style={{ background: getNumberColor(d.number) }} />
                    {getNumberColorName(d.number)}
                  </td>
                  <td className="text-center">
                    <span className="inline-flex w-7 h-7 rounded-lg items-center justify-center text-[11px] font-bold text-white"
                      style={{ background: getNumberColor(d.number) }}>
                      {d.number}
                    </span>
                  </td>
                  <td className="text-right font-semibold">₹{Number(d.bet_amount || 0).toLocaleString("en-IN")}</td>
                  <td className="text-center">{d.user_count || 0}</td>
                  <td className="text-right font-medium text-warning">₹{Number(d.payout || 0).toLocaleString("en-IN")}</td>
                </tr>
              )) : (
                <tr><td colSpan={5} className="text-center py-8 text-muted-foreground text-sm">Waiting for bets...</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Live Bets */}
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
        className="glass-table rounded-xl overflow-hidden">
        <div className="px-5 py-3.5 flex items-center gap-2.5 border-b border-border">
          <Users className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-bold text-foreground font-display">Live Bets</h3>
          <span className="ml-auto text-[10px] font-medium px-2 py-0.5 rounded-full bg-success/10 text-success">
            Auto-refresh 2s
          </span>
        </div>

        {liveBetsLoading ? (
          <div className="flex items-center justify-center py-16"><Loader2 className="w-5 h-5 animate-spin text-primary" /></div>
        ) : !liveBets?.length ? (
          <div className="text-center py-16 text-muted-foreground text-sm">No live bets yet</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="admin-table">
              <thead>
                <tr>
                  <th className="text-left">User ID</th>
                  <th className="text-center">Value</th>
                  <th className="text-right">Amount</th>
                  <th className="text-left">Mobile</th>
                  <th className="text-right">Balance</th>
                </tr>
              </thead>
              <tbody>
                {liveBets.map((b: any, i: number) => (
                  <tr key={b.id || i}>
                    <td className="font-mono text-foreground">{b.user_id?.slice(0, 8) || "—"}</td>
                    <td className="text-center font-semibold">{b.bet_value}</td>
                    <td className="text-right font-semibold">₹{Number(b.amount || 0).toLocaleString("en-IN")}</td>
                    <td className="text-muted-foreground">{b.mobile || "—"}</td>
                    <td className="text-right">₹{Number(b.balance || 0).toLocaleString("en-IN")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>

      {/* Period History */}
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
        className="glass-table rounded-xl overflow-hidden">
        <div className="px-5 py-3.5 flex items-center gap-2.5 border-b border-border">
          <h3 className="text-sm font-bold text-foreground font-display">Period History</h3>
          <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-primary/10 text-primary">Last 50</span>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-16"><Loader2 className="w-5 h-5 animate-spin text-primary" /></div>
        ) : !periods?.length ? (
          <div className="text-center py-16 text-muted-foreground text-sm">No periods yet</div>
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
                  <tr key={p.id || i}>
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
                    <td className="text-right font-medium text-warning">₹{Number(p.total_win).toLocaleString("en-IN")}</td>
                    <td className="text-center text-muted-foreground">{p.users_count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </div>
  );
}
