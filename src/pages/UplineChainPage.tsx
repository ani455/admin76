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

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <motion.div initial="hidden" animate="show" variants={containerVariants}>
      <motion.div variants={itemVariants} className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground font-display tracking-tight">Upline Chain</h1>
        <p className="text-sm text-muted-foreground mt-1">Trace any user's referral chain upward</p>
      </motion.div>

      <motion.div variants={itemVariants} className="glass-card-solid rounded-2xl p-6 mb-6 shadow-sm border-border/50">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder="Enter User ID or Mobile..."
              className="search-input w-full h-12 pl-10 pr-4"
            />
          </div>
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleSearch}
            className="btn-neon px-8 h-12 rounded-xl inline-flex items-center justify-center gap-2 text-sm font-display whitespace-nowrap"
            style={{ background: 'linear-gradient(135deg, hsl(220, 90%, 56%), hsl(220, 80%, 48%))' }}>
            Trace Chain
          </motion.button>
        </div>
      </motion.div>

      {isLoading && (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-3 border-primary/30 border-t-primary rounded-full animate-spin" />
        </div>
      )}

      {isError && (
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-10 bg-destructive/10 rounded-2xl border border-destructive/20">
          <p className="text-destructive font-medium">User not found or error occurred.</p>
        </motion.div>
      )}

      {chain && chain.length > 0 && (
        <div className="space-y-4 relative">
          <div className="absolute left-10 top-10 bottom-10 w-0.5 bg-gradient-to-b from-primary/50 via-border to-transparent -z-10" />
          
          {chain.map((u: any, i: number) => (
            <motion.div key={u.id} initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1, type: "spring", stiffness: 300, damping: 24 }}
              className="glass-card-solid rounded-2xl p-5 flex items-center gap-5 shadow-sm hover:shadow-md transition-shadow duration-300 relative group overflow-hidden border-border/50">
              
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent -translate-x-full group-hover:animate-[shimmer_2s_infinite]" />

              <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 relative z-10"
                style={{ 
                  background: i === 0 ? 'linear-gradient(135deg, hsl(220, 90%, 56%), hsl(220, 80%, 48%))' : 'hsl(var(--secondary))', 
                  boxShadow: i === 0 ? '0 4px 15px hsl(220, 90%, 56% / 0.3)' : 'none' 
                }}>
                {i === 0 ? <User className="w-5 h-5 text-white" /> : <ArrowUp className="w-5 h-5 text-muted-foreground" />}
                
                {/* Level Badge Badge */}
                <div className="absolute -top-2 -right-2 text-[9px] font-bold font-display px-2 py-0.5 rounded-full"
                  style={{ background: i === 0 ? 'hsl(var(--card))' : 'hsl(var(--primary)/0.1)', color: i === 0 ? 'hsl(var(--foreground))' : 'hsl(var(--primary))' }}>
                  L{i}
                </div>
              </div>
              
              <div className="flex-1 min-w-0 relative z-10">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className={`text-[10px] font-bold uppercase tracking-wider font-display ${i === 0 ? "text-primary" : "text-muted-foreground"}`}>
                    {i === 0 ? "Target User" : `Upline Level ${i}`}
                  </span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-end gap-1 sm:gap-4">
                  <p className="text-base font-bold text-foreground font-mono">{u.id}</p>
                  <p className="text-sm text-muted-foreground">📱 {u.mobile}</p>
                </div>
                <div className="flex items-center gap-3 mt-1.5 text-xs">
                  <span className="bg-secondary px-2 py-0.5 rounded text-muted-foreground border border-border/50">Code: <span className="font-mono text-foreground">{u.owncode || "—"}</span></span>
                  <span className="bg-secondary px-2 py-0.5 rounded text-muted-foreground border border-border/50">Ref by: <span className="font-mono text-foreground">{u.referral_code || "None"}</span></span>
                </div>
              </div>
              
              <div className="text-right relative z-10 hidden sm:block">
                <p className="text-xl font-bold text-foreground font-display">₹{Number(u.balance || 0).toLocaleString("en-IN")}</p>
                <p className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground mt-0.5">Current Balance</p>
              </div>
            </motion.div>
          ))}
          {chain.length > 0 && !chain[chain.length - 1].referral_code && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: chain.length * 0.1 + 0.2 }} className="text-center py-4 flex items-center justify-center gap-2 text-muted-foreground">
              <div className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center">
                <ArrowUp className="w-3 h-3" />
              </div>
              <span className="text-xs font-medium uppercase tracking-widest font-display">Top of the chain reached</span>
            </motion.div>
          )}
        </div>
      )}

      {chain && chain.length === 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center text-muted-foreground py-20 glass-card-solid rounded-2xl border border-dashed border-border">
          <Link2 className="w-10 h-10 mx-auto text-muted-foreground/30 mb-3" />
          <p className="font-medium">No upline chain found for this user.</p>
        </motion.div>
      )}
    </motion.div>
  );
}
