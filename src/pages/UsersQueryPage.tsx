import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { remoteDb } from "@/lib/remoteDb";
import { MessageSquare, Search, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

export default function UsersQueryPage() {
  const [search, setSearch] = useState("");
  const [data, setData] = useState<any>(null);

  const queryMutation = useMutation({
    mutationFn: () => remoteDb("user_query", { userId: search }),
    onSuccess: setData,
    onError: () => setData(null),
  });

  return (
    <div>
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'hsl(220, 90%, 56% / 0.12)', border: '1px solid hsl(220, 90%, 56% / 0.15)' }}>
          <MessageSquare className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-foreground font-display">Users Query</h2>
          <p className="text-[11px] text-muted-foreground">Search user details by ID or mobile</p>
        </div>
      </motion.div>

      <div className="flex gap-3 mb-6 max-w-md">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input type="text" placeholder="Enter User ID or Mobile..." className="search-input" value={search}
            onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === "Enter" && queryMutation.mutate()} />
        </div>
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => queryMutation.mutate()} disabled={!search || queryMutation.isPending}
          className="btn-neon px-5 py-2.5 text-[12px] font-display disabled:opacity-50">
          {queryMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Search"}
        </motion.button>
      </div>

      {data?.user && (
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <div className="glass-card-solid rounded-2xl p-6">
            <h3 className="text-sm font-bold text-foreground font-display mb-4">User Details</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "User ID", value: data.user.id },
                { label: "Mobile", value: data.user.mobile },
                { label: "Name", value: data.user.name || "—" },
                { label: "Balance", value: `₹${Number(data.user.balance).toLocaleString("en-IN")}` },
                { label: "Total Recharge", value: `₹${Number(data.user.total_recharge).toLocaleString("en-IN")}` },
                { label: "Total Withdraw", value: `₹${Number(data.user.total_withdraw).toLocaleString("en-IN")}` },
                { label: "Referral Code", value: data.user.referral_code || "—" },
                { label: "Own Code", value: data.user.owncode || "—" },
                { label: "IP", value: data.user.ip_address || "—" },
                { label: "Status", value: data.user.account_frozen === 1 ? "Frozen" : "Active" },
                { label: "Registered", value: new Date(data.user.created_at).toLocaleDateString("en-IN") },
              ].map((item) => (
                <div key={item.label}>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.1em] font-display mb-1">{item.label}</p>
                  <p className="text-sm text-foreground font-medium">{item.value}</p>
                </div>
              ))}
            </div>
          </div>

          {data.banks?.length > 0 && (
            <div className="glass-table rounded-2xl overflow-hidden">
              <div className="px-5 py-3.5" style={{ borderBottom: '1px solid hsl(var(--border))', background: 'hsl(var(--card))' }}>
                <h3 className="text-[11px] font-bold text-muted-foreground uppercase tracking-[0.1em] font-display">Bank Details</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="admin-table">
                  <thead><tr><th>Name</th><th>Type</th><th>Account</th></tr></thead>
                  <tbody>
                    {data.banks.map((b: any) => (
                      <tr key={b.id}><td>{b.name}</td><td>{b.type}</td><td className="font-mono">{b.account}</td></tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {data.referrals?.length > 0 && (
            <div className="glass-table rounded-2xl overflow-hidden">
              <div className="px-5 py-3.5" style={{ borderBottom: '1px solid hsl(var(--border))', background: 'hsl(var(--card))' }}>
                <h3 className="text-[11px] font-bold text-muted-foreground uppercase tracking-[0.1em] font-display">Referrals ({data.referrals.length})</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="admin-table">
                  <thead><tr><th>ID</th><th>Mobile</th><th>Registered</th></tr></thead>
                  <tbody>
                    {data.referrals.map((r: any) => (
                      <tr key={r.id}><td className="font-mono">{r.id}</td><td>{r.mobile}</td><td className="text-muted-foreground">{new Date(r.createdate).toLocaleDateString("en-IN")}</td></tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}
