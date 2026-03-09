import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { remoteDb } from "@/lib/remoteDb";
import { MinusCircle, Search, Plus, Minus } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

export default function BalanceDeductionPage() {
  const queryClient = useQueryClient();
  const [userId, setUserId] = useState("");
  const [searchId, setSearchId] = useState("");
  const [amount, setAmount] = useState("");
  const [action, setAction] = useState<"add" | "deduct">("deduct");

  const { data: user, isLoading, isError } = useQuery({
    queryKey: ["balance-user", searchId],
    queryFn: () => remoteDb("user_query", { userId: searchId }),
    enabled: !!searchId,
  });

  const mutation = useMutation({
    mutationFn: () => {
      const fn = action === "add" ? "add_user_balance" : "deduct_user_balance";
      return remoteDb(fn, { userId: user?.user?.id, amount: Number(amount) });
    },
    onSuccess: () => {
      toast.success(`Balance ${action === "add" ? "added" : "deducted"} successfully!`);
      setAmount("");
      queryClient.invalidateQueries({ queryKey: ["balance-user", searchId] });
    },
    onError: (e: any) => toast.error(e.message),
  });

  const handleSearch = () => {
    if (!userId.trim()) { toast.error("Enter User ID or Mobile"); return; }
    setSearchId(userId.trim());
  };

  const handleSubmit = () => {
    if (!amount || Number(amount) <= 0) { toast.error("Enter valid amount"); return; }
    mutation.mutate();
  };

  const fmt = (n: number) => `₹${Number(n || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <motion.div initial="hidden" animate="show" variants={containerVariants}>
      <motion.div variants={itemVariants} className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground font-display tracking-tight">Balance Deduction</h1>
        <p className="text-sm text-muted-foreground mt-1">Add or deduct balance from any user</p>
      </motion.div>

      <motion.div variants={itemVariants} className="glass-card-solid rounded-2xl p-6 mb-6 shadow-sm border-border/50">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input value={userId} onChange={(e) => setUserId(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder="Enter User ID or Mobile..." className="search-input w-full h-12 pl-10 pr-4" />
          </div>
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleSearch}
            className="btn-neon px-8 h-12 rounded-xl inline-flex items-center justify-center gap-2 text-sm font-display whitespace-nowrap"
            style={{ background: 'linear-gradient(135deg, hsl(220, 90%, 56%), hsl(220, 80%, 48%))' }}>
            Search User
          </motion.button>
        </div>
      </motion.div>

      {isLoading && <div className="flex justify-center py-20"><div className="w-8 h-8 border-3 border-primary/30 border-t-primary rounded-full animate-spin" /></div>}
      {isError && (
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-10 bg-destructive/10 rounded-2xl border border-destructive/20">
          <p className="text-destructive font-medium">User not found. Please try again.</p>
        </motion.div>
      )}

      {user?.user && (
        <motion.div variants={itemVariants} className="glass-card-solid rounded-2xl p-6 shadow-sm border-border/50 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/50 via-primary to-primary/50" />
          
          {/* User Info */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 p-5 rounded-xl border border-border/30" style={{ background: 'hsl(var(--muted) / 0.3)' }}>
            <div><p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground font-display mb-1">User ID</p><p className="text-sm font-bold text-foreground font-mono">{user.user.id}</p></div>
            <div><p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground font-display mb-1">Mobile</p><p className="text-sm font-bold text-foreground font-mono">{user.user.mobile}</p></div>
            <div><p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground font-display mb-1">Current Balance</p><p className="text-xl font-bold text-primary font-display">{fmt(user.user.balance)}</p></div>
            <div><p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground font-display mb-1">Name</p><p className="text-sm font-bold text-foreground font-display">{user.user.name || "—"}</p></div>
          </div>

          {/* Action */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <button onClick={() => setAction("deduct")}
              className={`flex-1 h-12 rounded-xl text-sm font-display font-bold flex items-center justify-center gap-2 transition-all duration-300 ${action === "deduct" ? "bg-destructive/10 text-destructive border-2 border-destructive/50 shadow-[0_0_15px_hsl(var(--destructive)/0.2)]" : "bg-secondary/50 text-muted-foreground border-2 border-transparent hover:bg-secondary"}`}>
              <Minus className="w-4 h-4" /> Deduct Balance
            </button>
            <button onClick={() => setAction("add")}
              className={`flex-1 h-12 rounded-xl text-sm font-display font-bold flex items-center justify-center gap-2 transition-all duration-300 ${action === "add" ? "bg-emerald-500/10 text-emerald-500 border-2 border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.2)]" : "bg-secondary/50 text-muted-foreground border-2 border-transparent hover:bg-secondary"}`}>
              <Plus className="w-4 h-4" /> Add Balance
            </button>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-bold font-display">₹</span>
              <input value={amount} onChange={(e) => setAmount(e.target.value)} type="number" placeholder="Enter amount..."
                className="search-input w-full h-12 pl-8 pr-4 font-mono font-bold text-lg" />
            </div>
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleSubmit} disabled={mutation.isPending}
              className={`px-8 h-12 rounded-xl inline-flex items-center justify-center gap-2 text-sm font-display font-bold text-white disabled:opacity-50 transition-all ${action === "deduct" ? "shadow-[0_4px_20px_hsl(var(--destructive)/0.3)] hover:shadow-[0_6px_25px_hsl(var(--destructive)/0.4)]" : "shadow-[0_4px_20px_rgba(16,185,129,0.3)] hover:shadow-[0_6px_25px_rgba(16,185,129,0.4)]"}`}
              style={{ background: action === "deduct" ? 'linear-gradient(135deg, hsl(0, 72%, 51%), hsl(0, 62%, 41%))' : 'linear-gradient(135deg, hsl(160, 80%, 40%), hsl(160, 70%, 30%))' }}>
              {mutation.isPending ? "Processing..." : action === "deduct" ? "Confirm Deduction" : "Confirm Addition"}
            </motion.button>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
