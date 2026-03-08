import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { remoteDb } from "@/lib/remoteDb";
import { Gift, Plus, Trash2, Copy, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

export default function GiftCodePage() {
  const queryClient = useQueryClient();
  const [count, setCount] = useState("1");
  const [maxUsers, setMaxUsers] = useState("1");
  const [price, setPrice] = useState("");
  const [remark, setRemark] = useState("");

  const { data: codes, isLoading } = useQuery({
    queryKey: ["gift-codes"],
    queryFn: () => remoteDb("get_gift_codes"),
  });

  const createMutation = useMutation({
    mutationFn: () => remoteDb("create_gift_code", { count: Number(count), max_users: Number(maxUsers), price: Number(price), remark }),
    onSuccess: (d) => {
      toast.success(`${d.codes.length} gift code(s) created!`);
      queryClient.invalidateQueries({ queryKey: ["gift-codes"] });
      setPrice(""); setRemark("");
    },
    onError: (e: any) => toast.error("Error: " + e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: (code: string) => remoteDb("delete_gift_code", { code }),
    onSuccess: () => { toast.success("Deleted!"); queryClient.invalidateQueries({ queryKey: ["gift-codes"] }); },
  });

  const copyText = (text: string) => { navigator.clipboard.writeText(text); toast.success("Copied!"); };

  return (
    <div>
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'hsl(270, 80%, 55% / 0.12)', border: '1px solid hsl(270, 80%, 55% / 0.15)' }}>
          <Gift className="w-5 h-5" style={{ color: 'hsl(270, 80%, 60%)' }} />
        </div>
        <div>
          <h2 className="text-lg font-bold text-foreground font-display">Gift Code Manager</h2>
          <p className="text-[11px] text-muted-foreground">Generate and manage gift codes</p>
        </div>
      </motion.div>

      {/* Create Form */}
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card-solid rounded-2xl p-6 mb-6">
        <h3 className="text-sm font-bold text-foreground font-display mb-4">Generate New Codes</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div>
            <label className="block text-[10px] font-bold text-muted-foreground mb-2 uppercase tracking-[0.1em] font-display">Count (max 50)</label>
            <input type="number" value={count} onChange={(e) => setCount(e.target.value)} className="search-input !pl-4" min="1" max="50" />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-muted-foreground mb-2 uppercase tracking-[0.1em] font-display">Max Users</label>
            <input type="number" value={maxUsers} onChange={(e) => setMaxUsers(e.target.value)} className="search-input !pl-4" min="1" />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-muted-foreground mb-2 uppercase tracking-[0.1em] font-display">Amount (₹)</label>
            <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} className="search-input !pl-4" placeholder="100" />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-muted-foreground mb-2 uppercase tracking-[0.1em] font-display">Remark</label>
            <input type="text" value={remark} onChange={(e) => setRemark(e.target.value)} className="search-input !pl-4" placeholder="Optional" />
          </div>
        </div>
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => createMutation.mutate()} disabled={createMutation.isPending || !price}
          className="btn-neon inline-flex items-center gap-2 px-5 py-2.5 text-[12px] font-display disabled:opacity-50">
          <Plus className="w-4 h-4" />
          {createMutation.isPending ? "Generating..." : "Generate Codes"}
        </motion.button>
      </motion.div>

      {/* Codes List */}
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-table rounded-2xl overflow-hidden">
        <div className="px-5 py-3.5 flex items-center gap-2" style={{ borderBottom: '1px solid hsl(var(--border))', background: 'hsl(var(--card))' }}>
          <div className="w-2 h-2 rounded-full" style={{ background: 'hsl(270, 80%, 55%)' }} />
          <h3 className="text-[11px] font-bold text-muted-foreground uppercase tracking-[0.1em] font-display">Gift Codes</h3>
        </div>
        {isLoading ? (
          <div className="flex items-center justify-center py-16"><Loader2 className="w-5 h-5 animate-spin text-primary" /></div>
        ) : !codes?.length ? (
          <div className="text-center py-16 text-muted-foreground text-sm">No gift codes</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="admin-table">
              <thead>
                <tr>
                  <th className="text-left">Code</th>
                  <th className="text-right">Amount</th>
                  <th className="text-center">Max Users</th>
                  <th className="text-center">Used</th>
                  <th className="text-left">Remark</th>
                  <th className="text-left">Created</th>
                  <th className="text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {codes.map((c: any) => (
                  <tr key={c.code}>
                    <td className="font-mono text-foreground">
                      <span className="inline-flex items-center gap-1.5">
                        {c.code.slice(0, 16)}...
                        <button onClick={() => copyText(c.code)} className="text-muted-foreground hover:text-foreground"><Copy className="w-3 h-3" /></button>
                      </span>
                    </td>
                    <td className="text-right font-bold text-foreground">₹{Number(c.price).toLocaleString("en-IN")}</td>
                    <td className="text-center">{c.max_users}</td>
                    <td className="text-center">{c.used_count}</td>
                    <td className="text-muted-foreground">{c.remark || "—"}</td>
                    <td className="text-muted-foreground">{c.created_at ? new Date(c.created_at).toLocaleString("en-IN") : "—"}</td>
                    <td className="text-center">
                      <button onClick={() => deleteMutation.mutate(c.code)} className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-[hsl(0,72%,51%/0.1)] transition-all mx-auto">
                        <Trash2 className="w-3.5 h-3.5" style={{ color: 'hsl(0, 72%, 55%)' }} />
                      </button>
                    </td>
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
