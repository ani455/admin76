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
        <h1 className="text-2xl md:text-3xl font-bold text-foreground font-display tracking-tight">Subordinate Data</h1>
        <p className="text-sm text-muted-foreground mt-1">View referral downline and their stats</p>
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
            Search Downline
          </motion.button>
        </div>
      </motion.div>

      {isLoading && <div className="flex justify-center py-20"><div className="w-8 h-8 border-3 border-primary/30 border-t-primary rounded-full animate-spin" /></div>}
      {isError && (
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-10 bg-destructive/10 rounded-2xl border border-destructive/20">
          <p className="text-destructive font-medium">User not found or error occurred.</p>
        </motion.div>
      )}

      {data && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {[
              { label: "Total Referrals", value: data.summary?.totalReferrals || 0, icon: Users, color: "hsl(220, 90%, 56%)", bg: "hsl(220, 90%, 56% / 0.1)" },
              { label: "Total Recharge", value: fmt(data.summary?.totalRecharge || 0), icon: IndianRupee, color: "hsl(160, 80%, 45%)", bg: "hsl(160, 80%, 45% / 0.1)" },
              { label: "Total Withdraw", value: fmt(data.summary?.totalWithdraw || 0), icon: IndianRupee, color: "hsl(38, 92%, 50%)", bg: "hsl(38, 92%, 50% / 0.1)" },
              { label: "Total Balance", value: fmt(data.summary?.totalBalance || 0), icon: IndianRupee, color: "hsl(0, 72%, 60%)", bg: "hsl(0, 72%, 60% / 0.1)" },
            ].map((c, i) => (
              <motion.div variants={itemVariants} key={c.label} className="glass-card-solid rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow duration-300 relative overflow-hidden group">
                <div className="absolute -right-4 -top-4 w-16 h-16 rounded-full blur-xl opacity-50 group-hover:opacity-100 transition-opacity duration-300" style={{ background: c.color }} />
                <div className="flex items-start justify-between mb-4">
                  <div className="p-2.5 rounded-xl" style={{ background: c.bg, color: c.color }}>
                    <c.icon className="w-5 h-5" />
                  </div>
                </div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground font-display mb-1">{c.label}</p>
                <p className="text-2xl font-bold text-foreground font-display">{c.value}</p>
              </motion.div>
            ))}
          </div>

          {/* Referral List */}
          <motion.div variants={itemVariants} className="glass-card-solid rounded-2xl overflow-hidden shadow-sm border-border/50">
            <div className="p-5 border-b border-border/50 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-primary/10 text-primary">
                <Users className="w-4 h-4" />
              </div>
              <h3 className="text-base font-bold text-foreground font-display">Direct Referrals <span className="text-muted-foreground font-normal ml-1">({data.referrals?.length || 0})</span></h3>
            </div>
            <div className="overflow-x-auto">
              <table className="admin-table">
                <thead><tr className="border-b border-border/50">
                  <th className="text-left">User ID</th>
                  <th className="text-left">Mobile</th>
                  <th className="text-right">Balance</th>
                  <th className="text-right">Total RC</th>
                  <th className="text-right">Total WD</th>
                  <th className="text-left">Joined Date</th>
                </tr></thead>
                <tbody>
                  {(data.referrals || []).map((r: any, i: number) => (
                    <motion.tr 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      key={r.id} 
                      className="table-row-hover group"
                    >
                      <td className="font-mono text-xs font-medium">{r.id}</td>
                      <td className="font-medium">{r.mobile}</td>
                      <td className="text-right font-display font-bold">{fmt(r.balance)}</td>
                      <td className="text-right font-display font-semibold text-success">{fmt(r.total_recharge)}</td>
                      <td className="text-right font-display font-semibold text-warning">{fmt(r.total_withdraw)}</td>
                      <td className="text-xs text-muted-foreground">{r.created_at?.split(" ")[0] || "—"}</td>
                    </motion.tr>
                  ))}
                  {(!data.referrals || data.referrals.length === 0) && (
                    <tr><td colSpan={6} className="text-center py-10 text-muted-foreground">No referrals found for this user.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>
        </>
      )}
    </motion.div>
  );
}
