import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { remoteDb } from "@/lib/remoteDb";
import { Search, Loader2, ArrowDownToLine, CheckCircle2, XCircle, Clock, IndianRupee } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

export default function DepositUpdatePage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<"pending" | "completed">("pending");

  const { data: pendingDeposits, isLoading } = useQuery({
    queryKey: ["deposits-pending", search],
    queryFn: () => remoteDb("get_pending_deposits", { search }),
  });

  const { data: completedDeposits, isLoading: isLoadingCompleted } = useQuery({
    queryKey: ["deposits-completed"],
    queryFn: () => remoteDb("get_completed_deposits"),
  });

  const approveMutation = useMutation({
    mutationFn: (params: any) => remoteDb("approve_deposit", params),
    onSuccess: () => {
      toast.success("Deposit approved & balance updated!");
      queryClient.invalidateQueries({ queryKey: ["deposits-pending"] });
      queryClient.invalidateQueries({ queryKey: ["deposits-completed"] });
    },
    onError: (e: any) => toast.error("Error: " + e.message),
  });

  const rejectMutation = useMutation({
    mutationFn: (params: any) => remoteDb("reject_deposit", params),
    onSuccess: () => {
      toast.success("Deposit rejected!");
      queryClient.invalidateQueries({ queryKey: ["deposits-pending"] });
      queryClient.invalidateQueries({ queryKey: ["deposits-completed"] });
    },
    onError: (e: any) => toast.error("Error: " + e.message),
  });

  const pendingCount = pendingDeposits?.length || 0;
  const completedCount = completedDeposits?.length || 0;

  return (
    <div>
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-4 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-success/10 border border-success/15">
              <ArrowDownToLine className="w-5 h-5 text-success" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground font-display">Deposit Update</h2>
              <p className="text-[11px] text-muted-foreground">Manage pending & completed deposits</p>
            </div>
          </div>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input type="text" placeholder="Search UTR / Mobile..." className="search-input" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <div className="glass-card-solid rounded-xl p-3.5 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-warning/10">
              <Clock className="w-4 h-4 text-warning" />
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Pending</p>
              <p className="text-lg font-bold text-foreground">{pendingCount}</p>
            </div>
          </div>
          <div className="glass-card-solid rounded-xl p-3.5 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-success/10">
              <CheckCircle2 className="w-4 h-4 text-success" />
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Completed</p>
              <p className="text-lg font-bold text-foreground">{completedCount}</p>
            </div>
          </div>
          <div className="glass-card-solid rounded-xl p-3.5 items-center gap-3 hidden sm:flex">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-primary/10">
              <IndianRupee className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Total Value</p>
              <p className="text-lg font-bold text-foreground">
                ₹{((pendingDeposits || []).reduce((s: number, d: any) => s + Number(d.amount || 0), 0) +
                  (completedDeposits || []).filter((d: any) => d.status === "approved").reduce((s: number, d: any) => s + Number(d.amount || 0), 0)).toLocaleString("en-IN")}
              </p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-1 rounded-xl bg-secondary/60 w-fit">
          <button
            onClick={() => setActiveTab("pending")}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeTab === "pending"
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <span className="flex items-center gap-2">
              <Clock className="w-3.5 h-3.5" />
              Pending
              {pendingCount > 0 && (
                <span className="badge-warning text-[9px] px-1.5 py-0.5">{pendingCount}</span>
              )}
            </span>
          </button>
          <button
            onClick={() => setActiveTab("completed")}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeTab === "completed"
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Completed
            </span>
          </button>
        </div>
      </motion.div>

      {/* Pending Payments Tab */}
      {activeTab === "pending" && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-table rounded-2xl overflow-hidden">
          <div className="px-5 py-3.5 flex items-center gap-2 border-b border-border bg-card">
            <div className="w-2 h-2 rounded-full bg-warning" />
            <h3 className="text-[11px] font-bold text-muted-foreground uppercase tracking-[0.1em] font-display">Pending Payments</h3>
          </div>
          {isLoading ? (
            <div className="flex items-center justify-center py-16"><Loader2 className="w-5 h-5 animate-spin text-primary" /></div>
          ) : !pendingDeposits?.length ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <div className="w-12 h-12 rounded-2xl bg-muted/50 flex items-center justify-center">
                <Clock className="w-6 h-6 text-muted-foreground/50" />
              </div>
              <p className="text-muted-foreground text-sm">No pending deposits</p>
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th className="text-left">#</th>
                      <th className="text-left">User ID</th>
                      <th className="text-left">Mobile</th>
                      <th className="text-left">Reference No.</th>
                      <th className="text-right">Amount</th>
                      <th className="text-left">Order ID</th>
                      <th className="text-left">Date</th>
                      <th className="text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingDeposits.map((dep: any, idx: number) => (
                      <tr key={dep.id}>
                        <td className="text-muted-foreground">{idx + 1}</td>
                        <td className="font-mono text-foreground font-semibold">{String(dep.user_id).slice(0, 8)}</td>
                        <td>{dep.user_mobile || "—"}</td>
                        <td className="font-mono text-muted-foreground">{dep.utr || "—"}</td>
                        <td className="text-right font-bold text-foreground">₹{Number(dep.amount).toLocaleString("en-IN")}</td>
                        <td className="font-mono text-muted-foreground">{String(dep.id).slice(0, 8)}</td>
                        <td className="text-muted-foreground">{new Date(dep.created_at).toLocaleString("en-IN")}</td>
                        <td>
                          <div className="flex items-center justify-center gap-2">
                            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                              onClick={() => approveMutation.mutate({ id: dep.id, userId: dep.user_id, amount: Number(dep.amount), currentBalance: Number(dep.user_balance || 0), currentRecharge: Number(dep.user_total_recharge || 0) })}
                              disabled={approveMutation.isPending} className="btn-neon px-3 py-1.5 text-[11px] disabled:opacity-50">Approve</motion.button>
                            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                              onClick={() => rejectMutation.mutate({ id: dep.id })}
                              disabled={rejectMutation.isPending} className="btn-danger px-3 py-1.5 text-[11px] disabled:opacity-50">Reject</motion.button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="md:hidden p-3 space-y-3">
                {pendingDeposits.map((dep: any, idx: number) => (
                  <motion.div key={dep.id} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}
                    className="rounded-xl border border-border bg-card/50 p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-muted-foreground font-mono">#{idx + 1}</span>
                        <span className="font-mono text-foreground font-semibold text-sm">{String(dep.user_id).slice(0, 8)}</span>
                      </div>
                      <span className="badge-warning text-[10px]">Pending</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                      <div>
                        <p className="text-muted-foreground/70">Mobile</p>
                        <p className="text-foreground font-medium">{dep.user_mobile || "—"}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground/70">UTR</p>
                        <p className="text-foreground font-mono">{dep.utr || "—"}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground/70">Amount</p>
                        <p className="text-foreground font-bold text-base">₹{Number(dep.amount).toLocaleString("en-IN")}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground/70">Date</p>
                        <p className="text-foreground">{new Date(dep.created_at).toLocaleDateString("en-IN")}</p>
                      </div>
                    </div>
                    <div className="flex gap-2 pt-1">
                      <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                        onClick={() => approveMutation.mutate({ id: dep.id, userId: dep.user_id, amount: Number(dep.amount), currentBalance: Number(dep.user_balance || 0), currentRecharge: Number(dep.user_total_recharge || 0) })}
                        disabled={approveMutation.isPending} className="btn-neon flex-1 py-2 text-[11px] disabled:opacity-50">
                        <CheckCircle2 className="w-3.5 h-3.5 inline mr-1" />Approve
                      </motion.button>
                      <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                        onClick={() => rejectMutation.mutate({ id: dep.id })}
                        disabled={rejectMutation.isPending} className="btn-danger flex-1 py-2 text-[11px] disabled:opacity-50">
                        <XCircle className="w-3.5 h-3.5 inline mr-1" />Reject
                      </motion.button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </>
          )}
        </motion.div>
      )}

      {/* Completed Tab */}
      {activeTab === "completed" && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-table rounded-2xl overflow-hidden">
          <div className="px-5 py-3.5 flex items-center gap-2 border-b border-border bg-card">
            <div className="w-2 h-2 rounded-full bg-success" />
            <h3 className="text-[11px] font-bold text-muted-foreground uppercase tracking-[0.1em] font-display">Completed Records</h3>
          </div>
          {isLoadingCompleted ? (
            <div className="flex items-center justify-center py-16"><Loader2 className="w-5 h-5 animate-spin text-primary" /></div>
          ) : !completedDeposits?.length ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <div className="w-12 h-12 rounded-2xl bg-muted/50 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-muted-foreground/50" />
              </div>
              <p className="text-muted-foreground text-sm">No completed deposits</p>
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th className="text-left">#</th>
                      <th className="text-left">User ID</th>
                      <th className="text-left">Mobile</th>
                      <th className="text-left">Reference No.</th>
                      <th className="text-right">Amount</th>
                      <th className="text-left">Order ID</th>
                      <th className="text-center">Status</th>
                      <th className="text-left">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {completedDeposits.map((dep: any, idx: number) => (
                      <tr key={dep.id}>
                        <td className="text-muted-foreground">{idx + 1}</td>
                        <td className="font-mono text-foreground font-semibold">{String(dep.user_id).slice(0, 8)}</td>
                        <td>{dep.user_mobile || "—"}</td>
                        <td className="font-mono text-muted-foreground">{dep.utr || "—"}</td>
                        <td className="text-right font-bold text-foreground">₹{Number(dep.amount).toLocaleString("en-IN")}</td>
                        <td className="font-mono text-muted-foreground">{String(dep.id).slice(0, 8)}</td>
                        <td className="text-center">
                          <span className={dep.status === "approved" ? "badge-success" : "badge-danger"}>{dep.status}</span>
                        </td>
                        <td className="text-muted-foreground">{new Date(dep.created_at).toLocaleString("en-IN")}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="md:hidden p-3 space-y-3">
                {completedDeposits.map((dep: any, idx: number) => (
                  <div key={dep.id} className="rounded-xl border border-border bg-card/50 p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-muted-foreground font-mono">#{idx + 1}</span>
                        <span className="font-mono text-foreground font-semibold text-sm">{String(dep.user_id).slice(0, 8)}</span>
                      </div>
                      <span className={dep.status === "approved" ? "badge-success" : "badge-danger"}>{dep.status}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                      <div>
                        <p className="text-muted-foreground/70">Mobile</p>
                        <p className="text-foreground font-medium">{dep.user_mobile || "—"}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground/70">UTR</p>
                        <p className="text-foreground font-mono">{dep.utr || "—"}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground/70">Amount</p>
                        <p className="text-foreground font-bold text-base">₹{Number(dep.amount).toLocaleString("en-IN")}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground/70">Date</p>
                        <p className="text-foreground">{new Date(dep.created_at).toLocaleDateString("en-IN")}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </motion.div>
      )}
    </div>
  );
}
