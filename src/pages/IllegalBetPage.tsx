import { useQuery } from "@tanstack/react-query";
import { remoteDb } from "@/lib/remoteDb";
import { Ban, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

export default function IllegalBetPage() {
  const { data: bets, isLoading } = useQuery({
    queryKey: ["illegal-bets"],
    queryFn: () => remoteDb("get_illegal_bets"),
  });

  return (
    <div>
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'hsl(0, 72%, 51% / 0.12)', border: '1px solid hsl(0, 72%, 51% / 0.15)' }}>
          <Ban className="w-5 h-5" style={{ color: 'hsl(0, 72%, 55%)' }} />
        </div>
        <div>
          <h2 className="text-lg font-bold text-foreground font-display">Illegal Bet Manager</h2>
          <p className="text-[11px] text-muted-foreground">Detect suspicious betting activity</p>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-table rounded-2xl overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-20"><Loader2 className="w-5 h-5 animate-spin text-primary" /></div>
        ) : !bets?.length ? (
          <div className="text-center py-20 text-muted-foreground text-sm">No illegal bets detected</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="admin-table">
              <thead>
                <tr>
                  <th className="text-left">Period</th>
                  <th className="text-left">Game</th>
                  <th className="text-center">Users</th>
                  <th className="text-left">User IDs</th>
                </tr>
              </thead>
              <tbody>
                {bets.map((b: any, idx: number) => (
                  <tr key={idx}>
                    <td className="font-mono text-foreground font-semibold">{b.period_id}</td>
                    <td>{b.game_name}</td>
                    <td className="text-center"><span className="badge-danger">{b.user_count}</span></td>
                    <td className="font-mono text-muted-foreground text-[11px]">{b.users?.join(", ")}</td>
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
