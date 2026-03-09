import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { remoteDb } from "@/lib/remoteDb";
import { Search, Copy, Loader2, ArrowUpFromLine, CheckCircle2, XCircle, Clock, MessageSquare, IndianRupee } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

export default function WithdrawManagePage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<"pending" | "completed">("pending");
  const [remarkModalId, setRemarkModalId] = useState<string | null>(null);
  const [remarkText, setRemarkText] = useState("");
  const [rejectModalId, setRejectModalId] = useState<string | null>(null);
  const [rejectRemark, setRejectRemark] = useState("");
  const [addWager, setAddWager] = useState(false);
  const [wagerAmount, setWagerAmount] = useState("");

  const { data: pendingWithdrawals, isLoading } = useQuery({
    queryKey: ["withdrawals-pending", search],
    queryFn: () => remoteDb("get_pending_withdrawals", { search }),
  });

  const { data: completedWithdrawals, isLoading: isLoadingCompleted } = useQuery({
    queryKey: ["withdrawals-completed"],
    queryFn: () => remoteDb("get_completed_withdrawals"),
  });

  const approveMutation = useMutation({
    mutationFn: (params: any) => remoteDb("approve_withdrawal", params),
    onSuccess: () => {
      toast.success("Withdrawal approved!");
      setRemarkModalId(null);
      setRemarkText("");
      queryClient.invalidateQueries({ queryKey: ["withdrawals-pending"] });
      queryClient.invalidateQueries({ queryKey: ["withdrawals-completed"] });
    },
    onError: (e: any) => toast.error("Error: " + e.message),
  });

  const rejectMutation = useMutation({
    mutationFn: (params: any) => remoteDb("reject_withdrawal", params),
    onSuccess: () => {
      toast.success("Withdrawal rejected & balance refunded!");
      setRejectModalId(null);
      setRejectRemark("");
      setAddWager(false);
      setWagerAmount("");
      queryClient.invalidateQueries({ queryKey: ["withdrawals-pending"] });
      queryClient.invalidateQueries({ queryKey: ["withdrawals-completed"] });
    },
    onError: (e: any) => toast.error("Error: " + e.message),
  });

  const copyText = (text: string) => { navigator.clipboard.writeText(text); toast.success("Copied!"); };

  const pendingCount = pendingWithdrawals?.length || 0;
  const completedCount = completedWithdrawals?.length || 0;

  const handleApprove = (id: string) => {
    setRemarkModalId(id);
    setRemarkText("");
  };

  const confirmApprove = () => {
    if (!remarkModalId) return;
    approveMutation.mutate({ id: remarkModalId, remark: remarkText });
  };

  const handleReject = (id: string) => {
    setRejectModalId(id);
    setRejectRemark("");
    setAddWager(false);
    setWagerAmount("");
  };

  const confirmReject = () => {
    if (!rejectModalId) return;
    rejectMutation.mutate({
      id: rejectModalId,
      remark: rejectRemark,
      addWager,
      wagerAmount: addWager ? wagerAmount : undefined,
    });
  };

  return (
    <div>
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-4 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-warning/10 border border-warning/15">
              <ArrowUpFromLine className="w-5 h-5 text-warning" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground font-display">Withdraw Requests</h2>
              <p className="text-[11px] text-muted-foreground">Manage pending & completed withdrawals</p>
            </div>
          </div>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input type="text" placeholder="Search account / name / mobile..." className="search-input" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
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
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-1 rounded-xl bg-secondary/60 w-fit">
          <button onClick={() => setActiveTab("pending")}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${activeTab === "pending" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
            <span className="flex items-center gap-2">
              <Clock className="w-3.5 h-3.5" /> Pending
              {pendingCount > 0 && <span className="badge-warning text-[9px] px-1.5 py-0.5">{pendingCount}</span>}
            </span>
          </button>
          <button onClick={() => setActiveTab("completed")}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${activeTab === "completed" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5" /> Completed
            </span>
          </button>
        </div>
      </motion.div>

      {/* Pending Tab */}
      {activeTab === "pending" && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-table rounded-2xl overflow-hidden">
          <div className="px-5 py-3.5 flex items-center gap-2 border-b border-border bg-card">
            <div className="w-2 h-2 rounded-full bg-warning" />
            <h3 className="text-[11px] font-bold text-muted-foreground uppercase tracking-[0.1em] font-display">Pending Withdrawals</h3>
          </div>
          {isLoading ? (
            <div className="flex items-center justify-center py-16"><Loader2 className="w-5 h-5 animate-spin text-primary" /></div>
          ) : !pendingWithdrawals?.length ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <div className="w-12 h-12 rounded-2xl bg-muted/50 flex items-center justify-center">
                <Clock className="w-6 h-6 text-muted-foreground/50" />
              </div>
              <p className="text-muted-foreground text-sm">No pending withdrawals</p>
            </div>
          ) : (
            <>
              {/* Desktop */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th className="text-left">#</th>
                      <th className="text-left">User ID</th>
                      <th className="text-left">Mobile</th>
                      <th className="text-right">Amount</th>
                      <th className="text-right">Balance</th>
                      <th className="text-left">Holder Name</th>
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
                        <td className="font-mono text-foreground font-semibold text-[11px]">{String(w.user_id).slice(0, 10)}</td>
                        <td className="text-foreground">{w.user_mobile || "—"}</td>
                        <td className="text-right font-bold text-foreground">₹{Number(w.amount).toLocaleString("en-IN")}</td>
                        <td className="text-right font-medium text-info">₹{Number(w.user_balance || 0).toLocaleString("en-IN")}</td>
                        <td className="text-foreground font-medium">{w.holder_name || "—"}</td>
                        <td className="text-muted-foreground">{w.bank_name || "—"}</td>
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
                        <td className="text-muted-foreground text-[11px]">{new Date(w.created_at).toLocaleString("en-IN")}</td>
                        <td>
                          <div className="flex items-center justify-center gap-2">
                            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                              onClick={() => handleApprove(w.id)}
                              disabled={approveMutation.isPending} className="btn-neon px-3 py-1.5 text-[11px] disabled:opacity-50">Approve</motion.button>
                            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                              onClick={() => handleReject(w.id)}
                              disabled={rejectMutation.isPending} className="btn-danger px-3 py-1.5 text-[11px] disabled:opacity-50">Reject</motion.button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="lg:hidden p-3 space-y-3">
                {pendingWithdrawals.map((w: any, idx: number) => (
                  <motion.div key={w.id} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.04 }}
                    className="rounded-xl border border-border bg-card/50 p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-muted-foreground font-mono">#{idx + 1}</span>
                        <span className="font-mono text-foreground font-semibold text-sm">{String(w.user_id).slice(0, 10)}</span>
                      </div>
                      <span className="badge-warning text-[10px]">Pending</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                      <div>
                        <p className="text-muted-foreground/70">Mobile</p>
                        <p className="text-foreground font-medium">{w.user_mobile || "—"}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground/70">Amount</p>
                        <p className="text-foreground font-bold text-base">₹{Number(w.amount).toLocaleString("en-IN")}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground/70">Balance</p>
                        <p className="text-info font-medium">₹{Number(w.user_balance || 0).toLocaleString("en-IN")}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground/70">Holder</p>
                        <p className="text-foreground font-medium">{w.holder_name || "—"}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground/70">Bank</p>
                        <p className="text-foreground">{w.bank_name || "—"}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground/70">IFSC</p>
                        <p className="text-foreground font-mono">{w.ifsc || "—"}</p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-muted-foreground/70">Account No</p>
                        <div className="flex items-center gap-2">
                          <p className="text-foreground font-mono">{w.account_no || "—"}</p>
                          {w.account_no && (
                            <button onClick={() => copyText(w.account_no)} className="text-muted-foreground hover:text-foreground">
                              <Copy className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 pt-1">
                      <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                        onClick={() => handleApprove(w.id)}
                        disabled={approveMutation.isPending} className="btn-neon flex-1 py-2 text-[11px] disabled:opacity-50">
                        <CheckCircle2 className="w-3.5 h-3.5 inline mr-1" />Approve
                      </motion.button>
                      <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                        onClick={() => handleReject(w.id)}
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
            <h3 className="text-[11px] font-bold text-muted-foreground uppercase tracking-[0.1em] font-display">Completed Withdrawals</h3>
          </div>
          {isLoadingCompleted ? (
            <div className="flex items-center justify-center py-16"><Loader2 className="w-5 h-5 animate-spin text-primary" /></div>
          ) : !completedWithdrawals?.length ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <div className="w-12 h-12 rounded-2xl bg-muted/50 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-muted-foreground/50" />
              </div>
              <p className="text-muted-foreground text-sm">No completed withdrawals</p>
            </div>
          ) : (
            <>
              {/* Desktop */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th className="text-left">#</th>
                      <th className="text-left">User ID</th>
                      <th className="text-left">Mobile</th>
                      <th className="text-right">Amount</th>
                      <th className="text-left">Holder</th>
                      <th className="text-left">Bank</th>
                      <th className="text-left">Account No</th>
                      <th className="text-left">IFSC</th>
                      <th className="text-center">Status</th>
                      <th className="text-left">Remark</th>
                      <th className="text-left">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {completedWithdrawals.map((w: any, idx: number) => (
                      <tr key={w.id}>
                        <td className="text-muted-foreground">{idx + 1}</td>
                        <td className="font-mono text-foreground font-semibold text-[11px]">{String(w.user_id).slice(0, 10)}</td>
                        <td className="text-foreground">{w.user_mobile || "—"}</td>
                        <td className="text-right font-bold text-foreground">₹{Number(w.amount).toLocaleString("en-IN")}</td>
                        <td className="text-foreground font-medium">{w.holder_name || "—"}</td>
                        <td className="text-muted-foreground">{w.bank_name || "—"}</td>
                        <td className="font-mono">{w.account_no || "—"}</td>
                        <td className="font-mono text-muted-foreground">{w.ifsc || "—"}</td>
                        <td className="text-center">
                          <span className={w.status === "approved" ? "badge-success" : "badge-danger"}>{w.status}</span>
                        </td>
                        <td className="text-muted-foreground text-[11px] max-w-[150px] truncate">{w.remark || "—"}</td>
                        <td className="text-muted-foreground text-[11px]">{new Date(w.created_at).toLocaleString("en-IN")}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="lg:hidden p-3 space-y-3">
                {completedWithdrawals.map((w: any, idx: number) => (
                  <div key={w.id} className="rounded-xl border border-border bg-card/50 p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-muted-foreground font-mono">#{idx + 1}</span>
                        <span className="font-mono text-foreground font-semibold text-sm">{String(w.user_id).slice(0, 10)}</span>
                      </div>
                      <span className={w.status === "approved" ? "badge-success" : "badge-danger"}>{w.status}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                      <div>
                        <p className="text-muted-foreground/70">Mobile</p>
                        <p className="text-foreground font-medium">{w.user_mobile || "—"}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground/70">Amount</p>
                        <p className="text-foreground font-bold text-base">₹{Number(w.amount).toLocaleString("en-IN")}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground/70">Bank</p>
                        <p className="text-foreground">{w.bank_name || "—"}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground/70">Account</p>
                        <p className="text-foreground font-mono">{w.account_no || "—"}</p>
                      </div>
                      {w.remark && (
                        <div className="col-span-2">
                          <p className="text-muted-foreground/70">Remark</p>
                          <p className="text-foreground">{w.remark}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </motion.div>
      )}

      {/* Approve Modal */}
      <AnimatePresence>
        {remarkModalId && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm"
            onClick={() => setRemarkModalId(null)}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="glass-card-solid rounded-2xl p-6 w-full max-w-md space-y-4"
              onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5 text-success" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-foreground">Approve Withdrawal</h3>
                  <p className="text-[11px] text-muted-foreground">Add an optional remark</p>
                </div>
              </div>
              <div>
                <label className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wider mb-1.5 block">Remark</label>
                <input type="text" placeholder="e.g. Sent via NEFT" className="search-input" value={remarkText} onChange={(e) => setRemarkText(e.target.value)} />
              </div>
              <div className="flex gap-2">
                <button onClick={() => setRemarkModalId(null)} className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-muted-foreground bg-secondary hover:bg-secondary/80 transition-colors">Cancel</button>
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                  onClick={confirmApprove} disabled={approveMutation.isPending}
                  className="btn-neon flex-1 py-2.5 text-sm disabled:opacity-50">
                  {approveMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : "Approve"}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reject Modal */}
      <AnimatePresence>
        {rejectModalId && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm"
            onClick={() => setRejectModalId(null)}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="glass-card-solid rounded-2xl p-6 w-full max-w-md space-y-4"
              onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center">
                  <XCircle className="w-5 h-5 text-destructive" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-foreground">Reject Withdrawal</h3>
                  <p className="text-[11px] text-muted-foreground">Balance will be refunded to user</p>
                </div>
              </div>
              <div>
                <label className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wider mb-1.5 block">Remark</label>
                <input type="text" placeholder="e.g. Invalid bank details" className="search-input" value={rejectRemark} onChange={(e) => setRejectRemark(e.target.value)} />
              </div>
              <div className="rounded-xl border border-border p-3 space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${addWager ? "bg-primary border-primary" : "border-muted-foreground/30"}`}
                    onClick={() => setAddWager(!addWager)}>
                    {addWager && <CheckCircle2 className="w-3.5 h-3.5 text-primary-foreground" />}
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-foreground">Add Wager Requirement</p>
                    <p className="text-[10px] text-muted-foreground">Set wager amount before next withdrawal</p>
                  </div>
                </label>
                {addWager && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}>
                    <label className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wider mb-1.5 block">Wager Amount (₹)</label>
                    <input type="number" placeholder="e.g. 500" className="search-input" value={wagerAmount} onChange={(e) => setWagerAmount(e.target.value)} />
                  </motion.div>
                )}
              </div>
              <div className="flex gap-2">
                <button onClick={() => setRejectModalId(null)} className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-muted-foreground bg-secondary hover:bg-secondary/80 transition-colors">Cancel</button>
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                  onClick={confirmReject} disabled={rejectMutation.isPending}
                  className="btn-danger flex-1 py-2.5 text-sm disabled:opacity-50">
                  {rejectMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : "Reject & Refund"}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
