import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { remoteDb } from "@/lib/remoteDb";
import {
  Search, Ban, Eye, ChevronLeft, ChevronRight, Loader2, Users,
  Wallet, IndianRupee, ArrowUpDown, Filter, X, Plus, Minus,
  Phone, Globe, Calendar, Shield, TrendingUp, TrendingDown,
  CreditCard, UserCheck, Copy, RefreshCw, Lock
} from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

// ─── User Detail Drawer ───
function UserDetailDrawer({ userId, onClose }: { userId: string; onClose: () => void }) {
  const queryClient = useQueryClient();
  const [balanceAmount, setBalanceAmount] = useState("");
  const [activeTab, setActiveTab] = useState<"overview" | "deposits" | "withdrawals" | "referrals" | "bets">("overview");

  const { data, isLoading } = useQuery({
    queryKey: ["user-detail", userId],
    queryFn: () => remoteDb("get_user_detail", { userId }),
    enabled: !!userId,
  });

  const addBalanceMut = useMutation({
    mutationFn: (amount: number) => remoteDb("add_user_balance", { userId, amount }),
    onSuccess: () => { toast.success("Balance added"); queryClient.invalidateQueries({ queryKey: ["user-detail", userId] }); queryClient.invalidateQueries({ queryKey: ["manage-users"] }); setBalanceAmount(""); },
  });

  const deductBalanceMut = useMutation({
    mutationFn: (amount: number) => remoteDb("deduct_user_balance", { userId, amount }),
    onSuccess: () => { toast.success("Balance deducted"); queryClient.invalidateQueries({ queryKey: ["user-detail", userId] }); queryClient.invalidateQueries({ queryKey: ["manage-users"] }); setBalanceAmount(""); },
  });

  const banMut = useMutation({
    mutationFn: (status: string) => remoteDb("ban_user", { id: userId, status }),
    onSuccess: (d) => { toast.success(`User ${d.newStatus === "banned" ? "banned" : "unbanned"}`); queryClient.invalidateQueries({ queryKey: ["user-detail", userId] }); queryClient.invalidateQueries({ queryKey: ["manage-users"] }); },
  });

  const user = data?.user;
  const deposits = data?.deposits || [];
  const withdrawals = data?.withdrawals || [];
  const banks = data?.banks || [];
  const referrals = data?.referrals || [];
  const betStats = data?.betStats || {};

  const copyText = (text: string) => { navigator.clipboard.writeText(text); toast.success("Copied!"); };

  const tabs = [
    { id: "overview" as const, label: "Overview" },
    { id: "deposits" as const, label: `Deposits (${deposits.length})` },
    { id: "withdrawals" as const, label: `Withdrawals (${withdrawals.length})` },
    { id: "referrals" as const, label: `Referrals (${referrals.length})` },
    { id: "bets" as const, label: "Bet Stats" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex justify-end" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <motion.div
        initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 30, stiffness: 300 }}
        className="relative w-full max-w-[560px] h-full overflow-y-auto"
        style={{ background: "hsl(var(--card))", borderLeft: "1px solid hsl(var(--border))" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 px-6 py-4 flex items-center justify-between" style={{ background: "hsl(var(--card))", borderBottom: "1px solid hsl(var(--border))" }}>
          <h3 className="text-base font-bold text-foreground font-display">User Details</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-secondary transition-colors">
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-32"><Loader2 className="w-5 h-5 animate-spin text-primary" /></div>
        ) : !user ? (
          <div className="text-center py-32 text-muted-foreground text-sm">User not found</div>
        ) : (
          <div className="p-6 space-y-5">
            {/* User Card */}
            <div className="glass-card-solid rounded-2xl p-5">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-lg font-bold text-foreground">{user.name || "Unknown"}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Phone className="w-3.5 h-3.5 text-muted-foreground" />
                    <span className="text-sm font-mono text-muted-foreground">{user.mobile}</span>
                    <button onClick={() => copyText(user.mobile)} className="hover:text-primary transition-colors"><Copy className="w-3 h-3 text-muted-foreground" /></button>
                  </div>
                </div>
                <span className={user.account_frozen === 1 ? "badge-danger" : "badge-success"}>
                  {user.account_frozen === 1 ? "Frozen" : "Active"}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <InfoItem icon={<Globe className="w-3.5 h-3.5" />} label="IP Address" value={user.ip_address || "—"} mono />
                <InfoItem icon={<Calendar className="w-3.5 h-3.5" />} label="Registered" value={new Date(user.created_at).toLocaleDateString("en-IN")} />
                <InfoItem icon={<Shield className="w-3.5 h-3.5" />} label="Refer Code" value={user.referral_code || "—"} mono />
                <InfoItem icon={<UserCheck className="w-3.5 h-3.5" />} label="Own Code" value={user.owncode || "—"} mono />
                <InfoItem icon={<Lock className="w-3.5 h-3.5" />} label="Password" value={user.password || "—"} mono />
                <InfoItem icon={<IndianRupee className="w-3.5 h-3.5" />} label="User ID" value={String(user.id)} mono />
              </div>
            </div>

            {/* Balance Card */}
            <div className="rounded-2xl p-5" style={{ background: "linear-gradient(135deg, hsl(220, 90%, 56% / 0.08), hsl(270, 80%, 55% / 0.05))", border: "1px solid hsl(220, 90%, 56% / 0.15)" }}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Wallet className="w-4 h-4 text-primary" />
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Wallet Balance</span>
                </div>
                <p className="text-2xl font-bold text-foreground">₹{Number(user.balance).toLocaleString("en-IN")}</p>
              </div>

              <div className="grid grid-cols-2 gap-2 mb-4">
                <div className="rounded-xl p-3" style={{ background: "hsl(142, 71%, 45% / 0.06)", border: "1px solid hsl(142, 71%, 45% / 0.12)" }}>
                  <p className="text-[10px] text-muted-foreground uppercase mb-0.5">Total Recharge</p>
                  <p className="text-sm font-bold" style={{ color: "hsl(142, 71%, 55%)" }}>₹{Number(user.total_recharge).toLocaleString("en-IN")}</p>
                </div>
                <div className="rounded-xl p-3" style={{ background: "hsl(0, 72%, 51% / 0.06)", border: "1px solid hsl(0, 72%, 51% / 0.12)" }}>
                  <p className="text-[10px] text-muted-foreground uppercase mb-0.5">Total Withdraw</p>
                  <p className="text-sm font-bold" style={{ color: "hsl(0, 72%, 60%)" }}>₹{Number(user.total_withdraw).toLocaleString("en-IN")}</p>
                </div>
              </div>

              {/* Add/Deduct Balance */}
              <div className="flex gap-2">
                <input type="number" placeholder="Amount" value={balanceAmount} onChange={(e) => setBalanceAmount(e.target.value)}
                  className="search-input flex-1 !pl-3 text-sm" style={{ borderRadius: "10px" }} />
                <button
                  onClick={() => balanceAmount && addBalanceMut.mutate(Number(balanceAmount))}
                  disabled={!balanceAmount || addBalanceMut.isPending}
                  className="btn-neon px-3 py-2 text-xs flex items-center gap-1.5 disabled:opacity-40">
                  <Plus className="w-3.5 h-3.5" /> Add
                </button>
                <button
                  onClick={() => balanceAmount && deductBalanceMut.mutate(Number(balanceAmount))}
                  disabled={!balanceAmount || deductBalanceMut.isPending}
                  className="btn-danger px-3 py-2 text-xs flex items-center gap-1.5 disabled:opacity-40">
                  <Minus className="w-3.5 h-3.5" /> Deduct
                </button>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex gap-2">
              <button
                onClick={() => banMut.mutate(user.account_frozen === 1 ? "banned" : "active")}
                className={`flex-1 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                  user.account_frozen === 1 ? "btn-neon" : "btn-danger"
                }`}>
                {user.account_frozen === 1 ? <><Shield className="w-3.5 h-3.5" /> Unfreeze Account</> : <><Ban className="w-3.5 h-3.5" /> Freeze Account</>}
              </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 p-1 rounded-xl" style={{ background: "hsl(var(--muted))" }}>
              {tabs.map(tab => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 py-2 rounded-lg text-[11px] font-semibold transition-all ${
                    activeTab === tab.id
                      ? "bg-primary text-primary-foreground shadow-md"
                      : "text-muted-foreground hover:text-foreground"
                  }`}>
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <AnimatePresence mode="wait">
              <motion.div key={activeTab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.15 }}>
                {activeTab === "overview" && (
                  <div className="space-y-3">
                    {/* Bank Details */}
                    <SectionTitle title="Bank Details" />
                    {banks.length === 0 ? <EmptyState text="No bank details" /> : (
                      <div className="space-y-2">
                        {banks.map((b: any) => (
                          <div key={b.id} className="glass-card-solid rounded-xl p-3">
                            <div className="flex items-center gap-2 mb-1">
                              <CreditCard className="w-3.5 h-3.5 text-primary" />
                              <span className="text-xs font-semibold text-foreground">{b.name || "—"}</span>
                              <span className="badge-info ml-auto">{b.type || "Bank"}</span>
                            </div>
                            <p className="text-xs font-mono text-muted-foreground pl-5.5">{b.account || "—"}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Quick Stats */}
                    <SectionTitle title="Activity" />
                    <div className="grid grid-cols-3 gap-2">
                      <StatBox label="Deposits" value={user.deposit_count} />
                      <StatBox label="Withdrawals" value={user.withdraw_count} />
                      <StatBox label="Referrals" value={referrals.length} />
                    </div>
                  </div>
                )}

                {activeTab === "deposits" && (
                  <div className="space-y-2">
                    {deposits.length === 0 ? <EmptyState text="No deposits" /> : deposits.map((d: any) => (
                      <TransactionRow key={d.id} amount={d.amount} status={d.status} date={d.created_at} extra={d.utr ? `UTR: ${d.utr}` : undefined} type="deposit" />
                    ))}
                  </div>
                )}

                {activeTab === "withdrawals" && (
                  <div className="space-y-2">
                    {withdrawals.length === 0 ? <EmptyState text="No withdrawals" /> : withdrawals.map((w: any) => (
                      <TransactionRow key={w.id} amount={w.amount} status={w.status} date={w.created_at} type="withdrawal" />
                    ))}
                  </div>
                )}

                {activeTab === "referrals" && (
                  <div className="space-y-2">
                    {referrals.length === 0 ? <EmptyState text="No referrals" /> : referrals.map((r: any) => (
                      <div key={r.id} className="glass-card-solid rounded-xl p-3 flex items-center justify-between">
                        <div>
                          <p className="text-xs font-mono font-semibold text-foreground">{r.mobile}</p>
                          <p className="text-[10px] text-muted-foreground mt-0.5">{new Date(r.created_at).toLocaleDateString("en-IN")}</p>
                        </div>
                        <span className="text-[10px] font-mono text-muted-foreground">ID: {String(r.id).slice(0, 8)}</span>
                      </div>
                    ))}
                  </div>
                )}

                {activeTab === "bets" && (
                  <div className="grid grid-cols-3 gap-3">
                    <div className="glass-card-solid rounded-xl p-4 text-center">
                      <p className="text-[10px] text-muted-foreground uppercase mb-1">Total Bets</p>
                      <p className="text-lg font-bold text-foreground">{betStats.totalBetCount?.toLocaleString() || 0}</p>
                    </div>
                    <div className="glass-card-solid rounded-xl p-4 text-center">
                      <p className="text-[10px] text-muted-foreground uppercase mb-1">Bet Amount</p>
                      <p className="text-lg font-bold" style={{ color: "hsl(38, 92%, 60%)" }}>₹{Number(betStats.totalBetAmount || 0).toLocaleString("en-IN")}</p>
                    </div>
                    <div className="glass-card-solid rounded-xl p-4 text-center">
                      <p className="text-[10px] text-muted-foreground uppercase mb-1">Win Amount</p>
                      <p className="text-lg font-bold" style={{ color: "hsl(142, 71%, 55%)" }}>₹{Number(betStats.totalWinAmount || 0).toLocaleString("en-IN")}</p>
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        )}
      </motion.div>
    </div>
  );
}

// ─── Helper Components ───
function InfoItem({ icon, label, value, mono }: { icon: React.ReactNode; label: string; value: string; mono?: boolean }) {
  return (
    <div className="rounded-xl p-2.5" style={{ background: "hsl(var(--muted))" }}>
      <div className="flex items-center gap-1.5 mb-0.5">
        <span className="text-muted-foreground">{icon}</span>
        <span className="text-[10px] text-muted-foreground uppercase">{label}</span>
      </div>
      <p className={`text-xs font-semibold text-foreground ${mono ? "font-mono" : ""}`}>{value}</p>
    </div>
  );
}

function SectionTitle({ title }: { title: string }) {
  return <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest pt-2">{title}</p>;
}

function EmptyState({ text }: { text: string }) {
  return <div className="text-center py-8 text-muted-foreground text-xs">{text}</div>;
}

function StatBox({ label, value }: { label: string; value: number }) {
  return (
    <div className="glass-card-solid rounded-xl p-3 text-center">
      <p className="text-[10px] text-muted-foreground uppercase mb-0.5">{label}</p>
      <p className="text-base font-bold text-foreground">{value}</p>
    </div>
  );
}

function TransactionRow({ amount, status, date, extra, type }: { amount: number; status: string; date: string; extra?: string; type: "deposit" | "withdrawal" }) {
  return (
    <div className="glass-card-solid rounded-xl p-3 flex items-center justify-between">
      <div>
        <div className="flex items-center gap-2">
          {type === "deposit" ? <TrendingUp className="w-3.5 h-3.5" style={{ color: "hsl(142, 71%, 55%)" }} /> : <TrendingDown className="w-3.5 h-3.5" style={{ color: "hsl(0, 72%, 60%)" }} />}
          <span className="text-sm font-bold text-foreground">₹{Number(amount).toLocaleString("en-IN")}</span>
        </div>
        {extra && <p className="text-[10px] font-mono text-muted-foreground mt-0.5 pl-5.5">{extra}</p>}
      </div>
      <div className="text-right">
        <span className={status === "approved" ? "badge-success" : status === "pending" ? "badge-warning" : "badge-danger"}>{status}</span>
        <p className="text-[10px] text-muted-foreground mt-1">{new Date(date).toLocaleDateString("en-IN")}</p>
      </div>
    </div>
  );
}

// ─── Main Page ───
type SortField = "id" | "balance" | "total_recharge" | "created_at";
type StatusFilter = "all" | "active" | "frozen";

export default function ManageUsersPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [sortField, setSortField] = useState<SortField>("id");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [showFilters, setShowFilters] = useState(false);
  const perPage = 50;

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["manage-users", search, page],
    queryFn: () => remoteDb("get_users", { search, page, perPage }),
  });

  const banMutation = useMutation({
    mutationFn: (params: { id: string; status: string }) => remoteDb("ban_user", params),
    onSuccess: (d) => { toast.success(`User ${d.newStatus === "banned" ? "banned" : "unbanned"}`); queryClient.invalidateQueries({ queryKey: ["manage-users"] }); },
  });

  let users = data?.users || [];
  const totalCount = data?.total || 0;

  // Client-side filter
  if (statusFilter === "frozen") users = users.filter((u: any) => u.account_frozen === 1);
  else if (statusFilter === "active") users = users.filter((u: any) => u.account_frozen !== 1);

  // Client-side sort
  users = [...users].sort((a: any, b: any) => {
    let va = a[sortField], vb = b[sortField];
    if (sortField === "balance" || sortField === "total_recharge") { va = Number(va); vb = Number(vb); }
    if (sortField === "created_at") { va = new Date(va).getTime(); vb = new Date(vb).getTime(); }
    if (va < vb) return sortDir === "asc" ? -1 : 1;
    if (va > vb) return sortDir === "asc" ? 1 : -1;
    return 0;
  });

  const totalPages = Math.ceil(totalCount / perPage);

  const toggleSort = (field: SortField) => {
    if (sortField === field) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortField(field); setSortDir("desc"); }
  };

  const SortIcon = ({ field }: { field: SortField }) => (
    <ArrowUpDown className={`w-3 h-3 inline ml-1 transition-colors ${sortField === field ? "text-primary" : "text-muted-foreground/40"}`} />
  );

  return (
    <div>
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "hsl(220, 90%, 56% / 0.12)", border: "1px solid hsl(220, 90%, 56% / 0.15)" }}>
            <Users className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-foreground font-display">Manage Users</h2>
            <p className="text-[11px] text-muted-foreground">{totalCount} total users {isFetching && !isLoading && <Loader2 className="w-3 h-3 inline animate-spin ml-1" />}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowFilters(f => !f)}
            className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all border border-border ${showFilters ? "bg-primary text-primary-foreground" : "hover:bg-secondary"}`}>
            <Filter className="w-4 h-4" />
          </button>
          <button onClick={() => queryClient.invalidateQueries({ queryKey: ["manage-users"] })}
            className="w-9 h-9 rounded-xl flex items-center justify-center hover:bg-secondary transition-all border border-border">
            <RefreshCw className={`w-4 h-4 text-muted-foreground ${isFetching ? "animate-spin" : ""}`} />
          </button>
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input type="text" placeholder="Search mobile, name, IP, refer code..." className="search-input" value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
          </div>
        </div>
      </motion.div>

      {/* Filters Bar */}
      <AnimatePresence>
        {showFilters && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
            className="mb-4 overflow-hidden">
            <div className="flex flex-wrap gap-2 p-3 rounded-xl" style={{ background: "hsl(var(--muted))", border: "1px solid hsl(var(--border))" }}>
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider self-center mr-2">Status:</span>
              {(["all", "active", "frozen"] as StatusFilter[]).map(s => (
                <button key={s} onClick={() => setStatusFilter(s)}
                  className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all ${
                    statusFilter === s ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                  }`}>
                  {s === "all" ? "All" : s === "active" ? "Active" : "Frozen"}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Table */}
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-table rounded-2xl overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-20"><Loader2 className="w-5 h-5 animate-spin text-primary" /></div>
        ) : users.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground text-sm">No users found</div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th className="text-left">Mobile</th>
                    <th className="text-left">Name</th>
                    <th className="text-left">Refer Code</th>
                    <th className="text-left">IP Address</th>
                    <th className="text-right cursor-pointer select-none" onClick={() => toggleSort("balance")}>
                      Wallet <SortIcon field="balance" />
                    </th>
                    <th className="text-right cursor-pointer select-none" onClick={() => toggleSort("total_recharge")}>
                      Recharge <SortIcon field="total_recharge" />
                    </th>
                    <th className="text-left cursor-pointer select-none" onClick={() => toggleSort("created_at")}>
                      Reg. Date <SortIcon field="created_at" />
                    </th>
                    <th className="text-center">Status</th>
                    <th className="text-center">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user: any, i: number) => (
                    <motion.tr key={user.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.01 }}
                      className="cursor-pointer" onClick={() => setSelectedUserId(user.id)}>
                      <td className="font-mono font-semibold text-foreground">{user.mobile}</td>
                      <td className="text-muted-foreground">{user.name || "—"}</td>
                      <td className="text-muted-foreground font-mono">{user.referral_code || "—"}</td>
                      <td className="font-mono text-muted-foreground">{user.ip_address || "—"}</td>
                      <td className="text-right font-bold text-foreground">₹{Number(user.balance).toLocaleString("en-IN")}</td>
                      <td className="text-right font-medium" style={{ color: "hsl(142, 71%, 55%)" }}>₹{Number(user.total_recharge).toLocaleString("en-IN")}</td>
                      <td className="text-muted-foreground">{new Date(user.created_at).toLocaleDateString("en-IN")}</td>
                      <td className="text-center">
                        <span className={user.account_frozen === 1 ? "badge-danger" : "badge-success"}>{user.account_frozen === 1 ? "Frozen" : "Active"}</span>
                      </td>
                      <td className="text-center" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-center gap-1.5">
                          <button onClick={() => setSelectedUserId(user.id)} className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-secondary transition-all" title="View Details">
                            <Eye className="w-3.5 h-3.5 text-primary" />
                          </button>
                          <button
                            onClick={() => banMutation.mutate({ id: user.id, status: user.account_frozen === 1 ? "banned" : "active" })}
                            className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-destructive/10 transition-all"
                            title={user.account_frozen === 1 ? "Unfreeze" : "Freeze"}>
                            <Ban className="w-3.5 h-3.5 text-destructive" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3" style={{ borderTop: "1px solid hsl(225, 15%, 12%)", background: "hsl(228, 22%, 8%)" }}>
                <p className="text-[11px] text-muted-foreground font-medium">{(page - 1) * perPage + 1}–{Math.min(page * perPage, totalCount)} of {totalCount}</p>
                <div className="flex items-center gap-1">
                  <button onClick={() => setPage(1)} disabled={page === 1}
                    className="px-2 h-8 rounded-lg text-[10px] font-bold text-muted-foreground hover:text-foreground hover:bg-secondary transition-all disabled:opacity-30">First</button>
                  <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-all disabled:opacity-30">
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="px-3 text-[11px] font-bold text-muted-foreground font-mono">{page}/{totalPages}</span>
                  <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-all disabled:opacity-30">
                    <ChevronRight className="w-4 h-4" />
                  </button>
                  <button onClick={() => setPage(totalPages)} disabled={page >= totalPages}
                    className="px-2 h-8 rounded-lg text-[10px] font-bold text-muted-foreground hover:text-foreground hover:bg-secondary transition-all disabled:opacity-30">Last</button>
                </div>
              </div>
            )}
          </>
        )}
      </motion.div>

      {/* User Detail Drawer */}
      <AnimatePresence>
        {selectedUserId && (
          <UserDetailDrawer userId={selectedUserId} onClose={() => setSelectedUserId(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}
