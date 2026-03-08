import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { remoteDb } from "@/lib/remoteDb";
import { Link2, Search, ArrowUp, User } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

export default function UplineChainPage() {
  const [userId, setUserId] = useState("");
  const [searchId, setSearchId] = useState("");

  const { data: chain, isLoading, isError } = useQuery({
    queryKey: ["upline-chain", searchId],
    queryFn: () => remoteDb("get_upline_chain", { userId: searchId }),
    enabled: !!searchId,
  });

  const handleSearch = () => {
    if (!userId.trim()) { toast.error("Enter a User ID or Mobile"); return; }
    setSearchId(userId.trim());
  };

  return (
    <div>
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <h1 className="text-2xl font-bold text-foreground font-display tracking-tight">Upline Chain</h1>
        <p className="text-sm text-muted-foreground mt-1">Trace any user's referral chain upward</p>
      </motion.div>

      <div className="glass-card-solid rounded-2xl p-6 mb-6">
        <div className="flex gap-3">
          <input
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder="Enter User ID or Mobile..."
            className="input-dark flex-1 h-12 px-4 rounded-xl text-sm"
          />
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleSearch}
            className="btn-neon px-6 h-12 rounded-xl inline-flex items-center gap-2 text-sm font-display"
            style={{ background: 'linear-gradient(135deg, hsl(220, 90%, 56%), hsl(220, 80%, 48%))' }}>
            <Search className="w-4 h-4" /> Search
          </motion.button>
        </div>
      </div>

      {isLoading && (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-3 border-primary/30 border-t-primary rounded-full animate-spin" />
        </div>
      )}

      {isError && <p className="text-center text-destructive py-10">User not found or error occurred.</p>}

      {chain && chain.length > 0 && (
        <div className="space-y-3">
          {chain.map((u: any, i: number) => (
            <motion.div key={u.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}
              className="glass-card-solid rounded-2xl p-5 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: i === 0 ? 'hsl(220, 90%, 56% / 0.15)' : 'hsl(var(--muted))', border: i === 0 ? '1px solid hsl(220, 90%, 56% / 0.3)' : '1px solid hsl(var(--border))' }}>
                {i === 0 ? <User className="w-4 h-4 text-primary" /> : <ArrowUp className="w-4 h-4 text-muted-foreground" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground font-display">
                    {i === 0 ? "Target User" : `Level ${i}`}
                  </span>
                </div>
                <p className="text-sm font-bold text-foreground font-display mt-0.5">ID: {u.id}</p>
                <p className="text-xs text-muted-foreground">📱 {u.mobile} • Code: {u.owncode || "—"} • Referred by: {u.referral_code || "None"}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-foreground font-display">₹{Number(u.balance || 0).toLocaleString("en-IN")}</p>
                <p className="text-[10px] text-muted-foreground">Balance</p>
              </div>
            </motion.div>
          ))}
          {chain.length > 0 && !chain[chain.length - 1].referral_code && (
            <p className="text-center text-xs text-muted-foreground py-2">🔝 Top of the chain reached</p>
          )}
        </div>
      )}

      {chain && chain.length === 0 && (
        <p className="text-center text-muted-foreground py-10">No upline chain found for this user.</p>
      )}
    </div>
  );
}
