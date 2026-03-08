import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { remoteDb } from "@/lib/remoteDb";
import { Gift, Plus, Minus } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

export default function BonusManagePage() {
  const [userId, setUserId] = useState("");
  const [amount, setAmount] = useState("");

  const addMutation = useMutation({
    mutationFn: () => remoteDb("add_user_balance", { userId, amount: Number(amount) }),
    onSuccess: () => { toast.success(`₹${amount} added to user ${userId}`); setAmount(""); },
    onError: (e: any) => toast.error("Error: " + e.message),
  });

  const deductMutation = useMutation({
    mutationFn: () => remoteDb("deduct_user_balance", { userId, amount: Number(amount) }),
    onSuccess: () => { toast.success(`₹${amount} deducted from user ${userId}`); setAmount(""); },
    onError: (e: any) => toast.error("Error: " + e.message),
  });

  return (
    <div>
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'hsl(38, 92%, 50% / 0.12)', border: '1px solid hsl(38, 92%, 50% / 0.15)' }}>
          <Gift className="w-5 h-5" style={{ color: 'hsl(38, 92%, 55%)' }} />
        </div>
        <div>
          <h2 className="text-lg font-bold text-foreground font-display">Bonus / Balance Manage</h2>
          <p className="text-[11px] text-muted-foreground">Add or deduct user balance</p>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card-solid rounded-2xl p-6 lg:p-8 max-w-lg">
        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-[10px] font-bold text-muted-foreground mb-2 uppercase tracking-[0.1em] font-display">User ID</label>
            <input type="text" value={userId} onChange={(e) => setUserId(e.target.value)} className="search-input !pl-4" placeholder="Enter User ID" />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-muted-foreground mb-2 uppercase tracking-[0.1em] font-display">Amount (₹)</label>
            <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} className="search-input !pl-4" placeholder="Enter amount" />
          </div>
        </div>
        <div className="flex gap-3">
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => addMutation.mutate()} disabled={!userId || !amount || addMutation.isPending}
            className="btn-neon inline-flex items-center gap-2 px-5 py-2.5 text-[12px] font-display disabled:opacity-50">
            <Plus className="w-4 h-4" />
            {addMutation.isPending ? "Adding..." : "Add Balance"}
          </motion.button>
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => deductMutation.mutate()} disabled={!userId || !amount || deductMutation.isPending}
            className="btn-danger inline-flex items-center gap-2 px-5 py-2.5 text-[12px] font-display disabled:opacity-50">
            <Minus className="w-4 h-4" />
            {deductMutation.isPending ? "Deducting..." : "Deduct Balance"}
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}
