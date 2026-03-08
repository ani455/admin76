import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Search, CheckCircle, XCircle, Clock, Copy, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function WithdrawManagePage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [page, setPage] = useState(1);
  const perPage = 10;

  const { data, isLoading } = useQuery({
    queryKey: ["withdrawals", search, filter, page],
    queryFn: async () => {
      let query = supabase.from("withdrawals").select("*, users!inner(name, mobile)", { count: "exact" }).order("created_at", { ascending: false });
      if (filter !== "all") query = query.eq("status", filter);
      if (search) query = query.or(`account_no.ilike.%${search}%,users.name.ilike.%${search}%`);
      query = query.range((page - 1) * perPage, page * perPage - 1);
      const { data, count, error } = await query;
      if (error) throw error;
      return { withdrawals: data || [], total: count || 0 };
    },
  });

  const { data: summaryData } = useQuery({
    queryKey: ["withdrawals-summary"],
    queryFn: async () => {
      const result: Record<string, number> = { pending: 0, approved: 0, rejected: 0 };
      for (const status of ["pending", "approved", "rejected"]) {
        const { data } = await supabase.from("withdrawals").select("amount").eq("status", status);
        result[status] = data?.reduce((s, r) => s + Number(r.amount), 0) || 0;
      }
      return result;
    },
  });

  const statusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase.from("withdrawals").update({ status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Withdrawal updated!");
      queryClient.invalidateQueries({ queryKey: ["withdrawals"] });
      queryClient.invalidateQueries({ queryKey: ["withdrawals-summary"] });
    },
  });

  const withdrawals = data?.withdrawals || [];
  const totalCount = data?.total || 0;
  const totalPages = Math.ceil(totalCount / perPage);
  const fmt = (n: number) => `₹${n.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-extrabold text-foreground">Withdraw Requests</h2>
          <p className="text-sm text-muted-foreground">Manage withdrawal applications</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 bg-card border rounded-lg px-3 py-2 w-full sm:w-60">
            <Search className="w-4 h-4 text-muted-foreground" />
            <input type="text" placeholder="Search..." className="bg-transparent text-sm outline-none flex-1 placeholder:text-muted-foreground" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
          </div>
          <select value={filter} onChange={(e) => { setFilter(e.target.value); setPage(1); }} className="h-10 rounded-lg bg-card border px-3 text-sm outline-none focus:ring-2 focus:ring-primary">
            <option value="all">All</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: "Pending", value: fmt(summaryData?.pending || 0), color: "amber", icon: Clock },
          { label: "Approved", value: fmt(summaryData?.approved || 0), color: "green", icon: CheckCircle },
          { label: "Rejected", value: fmt(summaryData?.rejected || 0), color: "red", icon: XCircle },
        ].map((s, idx) => (
          <div key={s.label} className="bg-card rounded-xl border p-4 flex items-center gap-3 animate-slide-up" style={{ animationDelay: `${idx * 80}ms` }}>
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: `hsl(var(--stat-${s.color}) / 0.1)` }}>
              <s.icon className="w-5 h-5" style={{ color: `hsl(var(--stat-${s.color}))` }} />
            </div>
            <div>
              <p className="text-lg font-extrabold text-card-foreground">{s.value}</p>
              <p className="text-xs text-muted-foreground font-medium">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-card rounded-xl border overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
        ) : withdrawals.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            <p className="text-lg font-semibold">No withdrawals found</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-secondary/50">
                    <th className="text-left px-4 py-3 font-semibold text-muted-foreground">User</th>
                    <th className="text-right px-4 py-3 font-semibold text-muted-foreground">Amount</th>
                    <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Bank</th>
                    <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Account</th>
                    <th className="text-left px-4 py-3 font-semibold text-muted-foreground">IFSC</th>
                    <th className="text-center px-4 py-3 font-semibold text-muted-foreground">Status</th>
                    <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Date</th>
                    <th className="text-center px-4 py-3 font-semibold text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {withdrawals.map((w: any, idx: number) => {
                    const statusColors: Record<string, string> = { pending: "stat-amber", approved: "stat-green", rejected: "stat-red" };
                    return (
                      <tr key={w.id} className="border-b last:border-0 hover:bg-secondary/30 transition-colors animate-fade-in" style={{ animationDelay: `${idx * 30}ms` }}>
                        <td className="px-4 py-3">
                          <p className="font-medium text-card-foreground">{w.users?.name || "—"}</p>
                          <p className="text-xs text-muted-foreground">{w.users?.mobile}</p>
                        </td>
                        <td className="px-4 py-3 text-right font-bold text-card-foreground">₹{Number(w.amount).toLocaleString("en-IN")}</td>
                        <td className="px-4 py-3 text-card-foreground">{w.bank_name || "—"}</td>
                        <td className="px-4 py-3 font-mono text-xs text-muted-foreground flex items-center gap-1">
                          {w.account_no || "—"}
                          {w.account_no && (
                            <button onClick={() => { navigator.clipboard.writeText(w.account_no); toast.success("Copied!"); }} className="hover:text-primary transition-colors">
                              <Copy className="w-3 h-3" />
                            </button>
                          )}
                        </td>
                        <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{w.ifsc || "—"}</td>
                        <td className="px-4 py-3 text-center">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize" style={{ background: `hsl(var(--${statusColors[w.status]}) / 0.1)`, color: `hsl(var(--${statusColors[w.status]}))` }}>{w.status}</span>
                        </td>
                        <td className="px-4 py-3 text-xs text-muted-foreground">{new Date(w.created_at).toLocaleDateString("en-IN")}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-center gap-1">
                            {w.status === "pending" && (
                              <>
                                <button onClick={() => statusMutation.mutate({ id: w.id, status: "approved" })} className="w-7 h-7 rounded-md flex items-center justify-center transition-colors" style={{ background: "hsl(var(--stat-green) / 0.1)" }}><CheckCircle className="w-3.5 h-3.5" style={{ color: "hsl(var(--stat-green))" }} /></button>
                                <button onClick={() => statusMutation.mutate({ id: w.id, status: "rejected" })} className="w-7 h-7 rounded-md flex items-center justify-center transition-colors" style={{ background: "hsl(var(--stat-red) / 0.1)" }}><XCircle className="w-3.5 h-3.5" style={{ color: "hsl(var(--stat-red))" }} /></button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="flex items-center justify-between px-4 py-3 border-t bg-secondary/30">
              <p className="text-xs text-muted-foreground">Showing {(page - 1) * perPage + 1}–{Math.min(page * perPage, totalCount)} of {totalCount}</p>
              <div className="flex items-center gap-1">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="w-8 h-8 rounded-md flex items-center justify-center bg-card border hover:bg-secondary disabled:opacity-40 transition-colors"><ChevronLeft className="w-4 h-4" /></button>
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => (
                  <button key={i} onClick={() => setPage(i + 1)} className={`w-8 h-8 rounded-md flex items-center justify-center text-xs font-medium transition-colors ${page === i + 1 ? "bg-primary text-primary-foreground" : "bg-card border hover:bg-secondary"}`}>{i + 1}</button>
                ))}
                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages || totalPages === 0} className="w-8 h-8 rounded-md flex items-center justify-center bg-card border hover:bg-secondary disabled:opacity-40 transition-colors"><ChevronRight className="w-4 h-4" /></button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
