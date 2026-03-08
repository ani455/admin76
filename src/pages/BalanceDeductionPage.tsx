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

  return (
    <div>
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <h1 className="text-2xl font-bold text-foreground font-display tracking-tight">Balance Deduction</h1>
        <p className="text-sm text-muted-foreground mt-1">Add or deduct balance from any user</p>
      </motion.div>

      <div className="glass-card-solid rounded-2xl p-6 mb-6">
        <div className="flex gap-3">
          <input value={userId} onChange={(e) => setUserId(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder="Enter User ID or Mobile..." className="input-dark flex-1 h-12 px-4 rounded-xl text-sm" />
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleSearch}
            className="btn-neon px-6 h-12 rounded-xl inline-flex items-center gap-2 text-sm font-display"
            style={{ background: 'linear-gradient(135deg, hsl(220, 90%, 56%), hsl(220, 80%, 48%))' }}>
            <Search className="w-4 h-4" /> Search
          </motion.button>
        </div>
      </div>

      {isLoading && <div className="flex justify-center py-20"><div className="w-8 h-8 border-3 border-primary/30 border-t-primary rounded-full animate-spin" /></div>}
      {isError && <p className="text-center text-destructive py-10">User not found.</p>}

      {user?.user && (
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="glass-card-solid rounded-2xl p-6">
          {/* User Info */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 p-4 rounded-xl" style={{ background: 'hsl(var(--muted) / 0.3)' }}>
            <div><p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground font-display">User ID</p><p className="text-sm font-bold text-foreground font-display mt-0.5">{user.user.id}</p></div>
            <div><p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground font-display">Mobile</p><p className="text-sm font-bold text-foreground font-display mt-0.5">{user.user.mobile}</p></div>
            <div><p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground font-display">Current Balance</p><p className="text-lg font-bold text-primary font-display mt-0.5">{fmt(user.user.balance)}</p></div>
            <div><p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground font-display">Name</p><p className="text-sm font-bold text-foreground font-display mt-0.5">{user.user.name || "—"}</p></div>
          </div>

          {/* Action */}
          <div className="flex gap-3 mb-4">
            <button onClick={() => setAction("deduct")}
              className={`flex-1 h-12 rounded-xl text-sm font-display font-bold flex items-center justify-center gap-2 transition-all ${action === "deduct" ? "bg-destructive/20 text-destructive border border-destructive/30" : "bg-secondary text-muted-foreground border border-border"}`}>
              <Minus className="w-4 h-4" /> Deduct
            </button>
            <button onClick={() => setAction("add")}
              className={`flex-1 h-12 rounded-xl text-sm font-display font-bold flex items-center justify-center gap-2 transition-all ${action === "add" ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : "bg-secondary text-muted-foreground border border-border"}`}>
              <Plus className="w-4 h-4" /> Add
            </button>
          </div>

          <div className="flex gap-3">
            <input value={amount} onChange={(e) => setAmount(e.target.value)} type="number" placeholder="Enter amount..."
              className="input-dark flex-1 h-12 px-4 rounded-xl text-sm" />
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleSubmit} disabled={mutation.isPending}
              className="btn-neon px-8 h-12 rounded-xl inline-flex items-center gap-2 text-sm font-display disabled:opacity-50"
              style={{ background: action === "deduct" ? 'linear-gradient(135deg, hsl(0, 72%, 51%), hsl(0, 62%, 41%))' : 'linear-gradient(135deg, hsl(160, 80%, 40%), hsl(160, 70%, 30%))' }}>
              {mutation.isPending ? "Processing..." : action === "deduct" ? "Deduct Balance" : "Add Balance"}
            </motion.button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
