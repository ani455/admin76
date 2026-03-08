import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { remoteDb } from "@/lib/remoteDb";
import { DollarSign, Save } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

export default function UsdtRatePage() {
  const queryClient = useQueryClient();
  const { data: settings } = useQuery({
    queryKey: ["usdt-rate"],
    queryFn: () => remoteDb("get_usdt_rate"),
  });

  const [rate, setRate] = useState("");
  const currentRate = rate || String(settings?.rate || 85);

  const mutation = useMutation({
    mutationFn: () => remoteDb("update_usdt_rate", { rate: Number(currentRate) }),
    onSuccess: () => { toast.success("USDT rate updated!"); queryClient.invalidateQueries({ queryKey: ["usdt-rate"] }); },
    onError: (e: any) => toast.error("Error: " + e.message),
  });

  return (
    <div>
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'hsl(142, 71%, 45% / 0.12)', border: '1px solid hsl(142, 71%, 45% / 0.15)' }}>
          <DollarSign className="w-5 h-5" style={{ color: 'hsl(142, 71%, 50%)' }} />
        </div>
        <div>
          <h2 className="text-lg font-bold text-foreground font-display">USDT Rate</h2>
          <p className="text-[11px] text-muted-foreground">Set USDT to INR conversion rate</p>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card-solid rounded-2xl p-6 lg:p-8 max-w-md">
        <label className="block text-[10px] font-bold text-muted-foreground mb-2.5 uppercase tracking-[0.1em] font-display">1 USDT = ₹ (INR)</label>
        <input type="number" value={currentRate} onChange={(e) => setRate(e.target.value)} className="search-input mb-5 !pl-4" placeholder="e.g. 85" />
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => mutation.mutate()} disabled={mutation.isPending}
          className="btn-neon inline-flex items-center gap-2.5 px-6 py-3 text-[13px] font-display disabled:opacity-50">
          <Save className="w-4 h-4" />
          {mutation.isPending ? "Saving..." : "Update Rate"}
        </motion.button>
      </motion.div>
    </div>
  );
}
