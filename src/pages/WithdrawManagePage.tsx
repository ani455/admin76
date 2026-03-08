import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { remoteDb } from "@/lib/remoteDb";
import { Search, Copy, Loader2, ArrowUpFromLine } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

export default function WithdrawManagePage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");

  const { data: pendingWithdrawals, isLoading } = useQuery({
    queryKey: ["withdrawals-pending", search],
    queryFn: () => remoteDb("get_pending_withdrawals", { search }),
  });

  const { data: completedWithdrawals } = useQuery({
    queryKey: ["withdrawals-completed"],
    queryFn: () => remoteDb("get_completed_withdrawals"),
  });

  const approveMutation = useMutation({
    mutationFn: (params: any) => remoteDb("approve_withdrawal", params),
    onSuccess: () => {
      toast.success("Withdrawal approved & balance deducted!");
      queryClient.invalidateQueries({ queryKey: ["withdrawals-pending"] });
      queryClient.invalidateQueries({ queryKey: ["withdrawals-completed"] });
    },
    onError: (e: any) => toast.error("Error: " + e.message),
  });

  const rejectMutation = useMutation({
    mutationFn: (params: any) => remoteDb("reject_withdrawal", params),
    onSuccess: () => {
      toast.success("Withdrawal rejected!");
      queryClient.invalidateQueries({ queryKey: ["withdrawals-pending"] });
      queryClient.invalidateQueries({ queryKey: ["withdrawals-completed"] });
    },
    onError: (e: any) => toast.error("Error: " + e.message),
  });

  const copyText = (text: string) => { navigator.clipboard.writeText(text); toast.success("Copied!"); };

  return (
    <div>
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'hsl(38, 92%, 50% / 0.12)', border: '1px solid hsl(38, 92%, 50% / 0.15)' }}>
            <ArrowUpFromLine className="w-5 h-5" style={{ color: 'hsl(38, 92%, 55%)' }} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-foreground font-display">Withdraw Requests</h2>
            <p className="text-[11px] text-muted-foreground">Manage pending & completed withdrawals</p>
          </div>
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input type="text" placeholder="Search account / mobile..." className="search-input" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </motion.div>

      {/* Pending */}
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-table rounded-2xl overflow-hidden mb-6">
        <div className="px-5 py-3.5 flex items-center gap-2" style={{ borderBottom: '1px solid hsl(var(--border))', background: 'hsl(var(--card))' }}>
          <div className="w-2 h-2 rounded-full" style={{ background: 'hsl(38, 92%, 50%)' }} />
          <h3 className="text-[11px] font-bold text-muted-foreground uppercase tracking-[0.1em] font-display">Pending Withdrawals</h3>
        </div>
        {isLoading ? (
          <div className="flex items-center justify-center py-16"><Loader2 className="w-5 h-5 animate-spin text-primary" /></div>
        ) : !pendingWithdrawals?.length ? (
          <div className="text-center py-16 text-muted-foreground text-sm">No pending withdrawals</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="admin-table">
              <thead>
                <tr>
                  <th className="text-left">#</th>
                  <th className="text-left">Mobile</th>
                  <th className="text-right">Amount</th>
                  <th className="text-right">Balance</th>
                  <th className="text-left">Bank</th>
                  <th className="text-left">Account No</th>
                  <th className="text-left">IFSC</th>
                  <th className="text-left">Date</th>
                  <th className="text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {pendingWithdrawals.map((w: any, idx: number) => (
                  <tr key={w.id}>
                    <td className="text-muted-foreground">{idx + 1}</td>
                    <td className="text-foreground font-semibold">{w.user_mobile || "—"}</td>
                    <td className="text-right font-bold text-foreground">₹{Number(w.amount).toLocaleString("en-IN")}</td>
                    <td className="text-right font-medium" style={{ color: 'hsl(210, 100%, 60%)' }}>₹{Number(w.user_balance || 0).toLocaleString("en-IN")}</td>
                    <td>{w.bank_name || "—"}</td>
                    <td className="font-mono">
                      <span className="inline-flex items-center gap-1.5">
                        {w.account_no || "—"}
                        {w.account_no && (
                          <button onClick={() => copyText(w.account_no)} className="text-muted-foreground hover:text-foreground transition-colors">
                            <Copy className="w-3 h-3" />
                          </button>
                        )}
                      </span>
                    </td>
                    <td className="font-mono text-muted-foreground">{w.ifsc || "—"}</td>
                    <td className="text-muted-foreground">{new Date(w.created_at).toLocaleString("en-IN")}</td>
                    <td>
                      <div className="flex items-center justify-center gap-2">
                        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                          onClick={() => approveMutation.mutate({ id: w.id, userId: w.user_id, amount: Number(w.amount), currentBalance: Number(w.user_balance || 0), currentWithdraw: Number(w.user_total_withdraw || 0) })}
                          disabled={approveMutation.isPending} className="btn-neon px-3 py-1.5 text-[11px] disabled:opacity-50">Approve</motion.button>
                        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                          onClick={() => rejectMutation.mutate({ id: w.id })}
                          disabled={rejectMutation.isPending} className="btn-danger px-3 py-1.5 text-[11px] disabled:opacity-50">Reject</motion.button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>

      {/* Completed */}
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-table rounded-2xl overflow-hidden">
        <div className="px-5 py-3.5 flex items-center gap-2" style={{ borderBottom: '1px solid hsl(var(--border))', background: 'hsl(var(--card))' }}>
          <div className="w-2 h-2 rounded-full" style={{ background: 'hsl(142, 71%, 45%)' }} />
          <h3 className="text-[11px] font-bold text-muted-foreground uppercase tracking-[0.1em] font-display">Completed Withdrawals</h3>
        </div>
        {!completedWithdrawals?.length ? (
          <div className="text-center py-16 text-muted-foreground text-sm">No completed withdrawals</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="admin-table">
              <thead>
                <tr>
                  <th className="text-left">#</th>
                  <th className="text-left">Mobile</th>
                  <th className="text-right">Amount</th>
                  <th className="text-left">Bank</th>
                  <th className="text-left">Account No</th>
                  <th className="text-left">IFSC</th>
                  <th className="text-center">Status</th>
                  <th className="text-left">Date</th>
                </tr>
              </thead>
              <tbody>
                {completedWithdrawals.map((w: any, idx: number) => (
                  <tr key={w.id}>
                    <td className="text-muted-foreground">{idx + 1}</td>
                    <td className="text-foreground font-semibold">{w.user_mobile || "—"}</td>
                    <td className="text-right font-bold text-foreground">₹{Number(w.amount).toLocaleString("en-IN")}</td>
                    <td>{w.bank_name || "—"}</td>
                    <td className="font-mono">{w.account_no || "—"}</td>
                    <td className="font-mono text-muted-foreground">{w.ifsc || "—"}</td>
                    <td className="text-center">
                      <span className={w.status === "approved" ? "badge-success" : "badge-danger"}>{w.status}</span>
                    </td>
                    <td className="text-muted-foreground">{new Date(w.created_at).toLocaleString("en-IN")}</td>
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
