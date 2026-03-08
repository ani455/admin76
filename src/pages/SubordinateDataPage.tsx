import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { remoteDb } from "@/lib/remoteDb";
import { FileText, Search, Users, IndianRupee } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

export default function SubordinateDataPage() {
  const [userId, setUserId] = useState("");
  const [searchId, setSearchId] = useState("");

  const { data, isLoading, isError } = useQuery({
    queryKey: ["subordinate-data", searchId],
    queryFn: () => remoteDb("get_subordinate_data", { userId: searchId }),
    enabled: !!searchId,
  });

  const handleSearch = () => {
    if (!userId.trim()) { toast.error("Enter a User ID or Mobile"); return; }
    setSearchId(userId.trim());
  };

  const fmt = (n: number) => `₹${Number(n || 0).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;

  return (
    <div>
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <h1 className="text-2xl font-bold text-foreground font-display tracking-tight">Subordinate Data</h1>
        <p className="text-sm text-muted-foreground mt-1">View referral downline and their stats</p>
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
      {isError && <p className="text-center text-destructive py-10">User not found or error occurred.</p>}

      {data && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            {[
              { label: "Total Referrals", value: data.summary?.totalReferrals || 0, icon: Users, color: "hsl(220, 90%, 56%)" },
              { label: "Total RC", value: fmt(data.summary?.totalRecharge || 0), icon: IndianRupee, color: "hsl(170, 80%, 50%)" },
              { label: "Total WD", value: fmt(data.summary?.totalWithdraw || 0), icon: IndianRupee, color: "hsl(38, 92%, 58%)" },
              { label: "Total Balance", value: fmt(data.summary?.totalBalance || 0), icon: IndianRupee, color: "hsl(0, 72%, 60%)" },
            ].map((c) => (
              <div key={c.label} className="glass-card-solid rounded-2xl p-4">
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground font-display">{c.label}</p>
                <p className="text-lg font-bold text-foreground font-display mt-1">{c.value}</p>
              </div>
            ))}
          </div>

          {/* Referral List */}
          <div className="glass-card-solid rounded-2xl overflow-hidden">
            <div className="p-4 border-b border-border">
              <h3 className="text-sm font-bold text-foreground font-display">Direct Referrals ({data.referrals?.length || 0})</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b border-border">
                  <th className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground font-display">ID</th>
                  <th className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground font-display">Mobile</th>
                  <th className="text-right px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground font-display">Balance</th>
                  <th className="text-right px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground font-display">Total RC</th>
                  <th className="text-right px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground font-display">Total WD</th>
                  <th className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground font-display">Joined</th>
                </tr></thead>
                <tbody>
                  {(data.referrals || []).map((r: any) => (
                    <tr key={r.id} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                      <td className="px-4 py-3 font-mono text-xs">{r.id}</td>
                      <td className="px-4 py-3">{r.mobile}</td>
                      <td className="px-4 py-3 text-right font-display font-bold">{fmt(r.balance)}</td>
                      <td className="px-4 py-3 text-right text-emerald-400">{fmt(r.total_recharge)}</td>
                      <td className="px-4 py-3 text-right text-orange-400">{fmt(r.total_withdraw)}</td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">{r.created_at?.split(" ")[0] || "—"}</td>
                    </tr>
                  ))}
                  {(!data.referrals || data.referrals.length === 0) && (
                    <tr><td colSpan={6} className="text-center py-8 text-muted-foreground">No referrals found</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
