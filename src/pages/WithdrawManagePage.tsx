import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Search, Copy, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function WithdrawManagePage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");

  const { data: pendingWithdrawals, isLoading } = useQuery({
    queryKey: ["withdrawals-pending", search],
    queryFn: async () => {
      let query = supabase
        .from("withdrawals")
        .select("*, users!inner(name, mobile)")
        .eq("status", "pending")
        .order("created_at", { ascending: false });
      if (search) query = query.or(`account_no.ilike.%${search}%,users.mobile.ilike.%${search}%`);
      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
  });

  const { data: completedWithdrawals } = useQuery({
    queryKey: ["withdrawals-completed"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("withdrawals")
        .select("*, users!inner(name, mobile)")
        .neq("status", "pending")
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return data || [];
    },
  });

  const statusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase.from("withdrawals").update({ status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Updated!");
      queryClient.invalidateQueries({ queryKey: ["withdrawals-pending"] });
      queryClient.invalidateQueries({ queryKey: ["withdrawals-completed"] });
    },
  });

  const copyText = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied!");
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <h2 className="text-lg font-bold text-foreground">Withdraw Requests</h2>
        <div className="flex items-center gap-2 bg-card border rounded-md px-3 py-1.5 w-full sm:w-56">
          <Search className="w-3.5 h-3.5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search account / mobile..."
            className="bg-transparent text-xs outline-none flex-1 placeholder:text-muted-foreground"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Pending */}
      <div className="bg-card rounded-lg border overflow-hidden mb-5">
        <div className="px-3 py-2 border-b bg-muted/30">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Pending Withdrawals</h3>
        </div>
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-5 h-5 animate-spin text-primary" />
          </div>
        ) : !pendingWithdrawals?.length ? (
          <div className="text-center py-10 text-muted-foreground text-xs">No pending withdrawals</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b bg-muted/30">
                  <th className="text-left px-3 py-2 font-semibold text-muted-foreground">#</th>
                  <th className="text-left px-3 py-2 font-semibold text-muted-foreground">Mobile</th>
                  <th className="text-right px-3 py-2 font-semibold text-muted-foreground">Amount</th>
                  <th className="text-left px-3 py-2 font-semibold text-muted-foreground">Bank</th>
                  <th className="text-left px-3 py-2 font-semibold text-muted-foreground">Account No</th>
                  <th className="text-left px-3 py-2 font-semibold text-muted-foreground">IFSC</th>
                  <th className="text-left px-3 py-2 font-semibold text-muted-foreground">Date</th>
                  <th className="text-center px-3 py-2 font-semibold text-muted-foreground">Action</th>
                </tr>
              </thead>
              <tbody>
                {pendingWithdrawals.map((w: any, idx: number) => (
                  <tr key={w.id} className="border-b last:border-0 table-row-hover">
                    <td className="px-3 py-2 text-muted-foreground">{idx + 1}</td>
                    <td className="px-3 py-2">{w.users?.mobile || "—"}</td>
                    <td className="px-3 py-2 text-right font-semibold">₹{Number(w.amount).toLocaleString("en-IN")}</td>
                    <td className="px-3 py-2">{w.bank_name || "—"}</td>
                    <td className="px-3 py-2 font-mono">
                      <span className="inline-flex items-center gap-1">
                        {w.account_no || "—"}
                        {w.account_no && (
                          <button onClick={() => copyText(w.account_no)} className="hover:text-primary">
                            <Copy className="w-3 h-3" />
                          </button>
                        )}
                      </span>
                    </td>
                    <td className="px-3 py-2 font-mono text-muted-foreground">{w.ifsc || "—"}</td>
                    <td className="px-3 py-2 text-muted-foreground">{new Date(w.created_at).toLocaleString("en-IN")}</td>
                    <td className="px-3 py-2">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => statusMutation.mutate({ id: w.id, status: "approved" })}
                          className="px-2.5 py-1 rounded text-[11px] font-semibold bg-primary text-white hover:opacity-90"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => statusMutation.mutate({ id: w.id, status: "rejected" })}
                          className="px-2.5 py-1 rounded text-[11px] font-semibold bg-destructive text-white hover:opacity-90"
                        >
                          Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Completed */}
      <div className="bg-card rounded-lg border overflow-hidden">
        <div className="px-3 py-2 border-b bg-muted/30">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Completed Withdrawals</h3>
        </div>
        {!completedWithdrawals?.length ? (
          <div className="text-center py-10 text-muted-foreground text-xs">No completed withdrawals</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b bg-muted/30">
                  <th className="text-left px-3 py-2 font-semibold text-muted-foreground">#</th>
                  <th className="text-left px-3 py-2 font-semibold text-muted-foreground">Mobile</th>
                  <th className="text-right px-3 py-2 font-semibold text-muted-foreground">Amount</th>
                  <th className="text-left px-3 py-2 font-semibold text-muted-foreground">Bank</th>
                  <th className="text-left px-3 py-2 font-semibold text-muted-foreground">Account No</th>
                  <th className="text-left px-3 py-2 font-semibold text-muted-foreground">IFSC</th>
                  <th className="text-center px-3 py-2 font-semibold text-muted-foreground">Status</th>
                  <th className="text-left px-3 py-2 font-semibold text-muted-foreground">Date</th>
                </tr>
              </thead>
              <tbody>
                {completedWithdrawals.map((w: any, idx: number) => (
                  <tr key={w.id} className="border-b last:border-0 table-row-hover">
                    <td className="px-3 py-2 text-muted-foreground">{idx + 1}</td>
                    <td className="px-3 py-2">{w.users?.mobile || "—"}</td>
                    <td className="px-3 py-2 text-right font-semibold">₹{Number(w.amount).toLocaleString("en-IN")}</td>
                    <td className="px-3 py-2">{w.bank_name || "—"}</td>
                    <td className="px-3 py-2 font-mono">{w.account_no || "—"}</td>
                    <td className="px-3 py-2 font-mono text-muted-foreground">{w.ifsc || "—"}</td>
                    <td className="px-3 py-2 text-center">
                      <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold ${
                        w.status === "approved" ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"
                      }`}>
                        {w.status}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-muted-foreground">{new Date(w.created_at).toLocaleString("en-IN")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}