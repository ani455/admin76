import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Search, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function DepositUpdatePage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");

  // Pending deposits
  const { data: pendingDeposits, isLoading } = useQuery({
    queryKey: ["deposits-pending", search],
    queryFn: async () => {
      let query = supabase
        .from("deposits")
        .select("*, users!inner(name, mobile)")
        .eq("status", "pending")
        .order("created_at", { ascending: false });
      if (search) query = query.or(`utr.ilike.%${search}%,users.mobile.ilike.%${search}%`);
      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
  });

  // Completed deposits (approved/rejected)
  const { data: completedDeposits } = useQuery({
    queryKey: ["deposits-completed"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("deposits")
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
      const { error } = await supabase.from("deposits").update({ status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Updated!");
      queryClient.invalidateQueries({ queryKey: ["deposits-pending"] });
      queryClient.invalidateQueries({ queryKey: ["deposits-completed"] });
    },
  });

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <h2 className="text-lg font-bold text-foreground">Deposit Update</h2>
        <div className="flex items-center gap-2 bg-card border rounded-md px-3 py-1.5 w-full sm:w-56">
          <Search className="w-3.5 h-3.5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search UTR / Mobile..."
            className="bg-transparent text-xs outline-none flex-1 placeholder:text-muted-foreground"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Pending Payments */}
      <div className="bg-card rounded-lg border overflow-hidden mb-5">
        <div className="px-3 py-2 border-b bg-muted/30">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Pending Payments</h3>
        </div>
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-5 h-5 animate-spin text-primary" />
          </div>
        ) : !pendingDeposits?.length ? (
          <div className="text-center py-10 text-muted-foreground text-xs">No pending deposits</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b bg-muted/30">
                  <th className="text-left px-3 py-2 font-semibold text-muted-foreground">#</th>
                  <th className="text-left px-3 py-2 font-semibold text-muted-foreground">User ID</th>
                  <th className="text-left px-3 py-2 font-semibold text-muted-foreground">Mobile</th>
                  <th className="text-left px-3 py-2 font-semibold text-muted-foreground">Reference Number</th>
                  <th className="text-right px-3 py-2 font-semibold text-muted-foreground">Amount</th>
                  <th className="text-left px-3 py-2 font-semibold text-muted-foreground">Order ID</th>
                  <th className="text-left px-3 py-2 font-semibold text-muted-foreground">Date</th>
                  <th className="text-center px-3 py-2 font-semibold text-muted-foreground">Action</th>
                </tr>
              </thead>
              <tbody>
                {pendingDeposits.map((dep: any, idx: number) => (
                  <tr key={dep.id} className="border-b last:border-0 table-row-hover">
                    <td className="px-3 py-2 text-muted-foreground">{idx + 1}</td>
                    <td className="px-3 py-2 font-mono">{dep.user_id.slice(0, 8)}</td>
                    <td className="px-3 py-2">{dep.users?.mobile || "—"}</td>
                    <td className="px-3 py-2 font-mono text-muted-foreground">{dep.utr || "—"}</td>
                    <td className="px-3 py-2 text-right font-semibold">₹{Number(dep.amount).toLocaleString("en-IN")}</td>
                    <td className="px-3 py-2 font-mono text-muted-foreground">{dep.id.slice(0, 8)}</td>
                    <td className="px-3 py-2 text-muted-foreground">{new Date(dep.created_at).toLocaleString("en-IN")}</td>
                    <td className="px-3 py-2">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => statusMutation.mutate({ id: dep.id, status: "approved" })}
                          className="px-2.5 py-1 rounded text-[11px] font-semibold bg-primary text-white hover:opacity-90 transition-opacity"
                        >
                          Approve Payment
                        </button>
                        <button
                          onClick={() => statusMutation.mutate({ id: dep.id, status: "rejected" })}
                          className="px-2.5 py-1 rounded text-[11px] font-semibold bg-destructive text-white hover:opacity-90 transition-opacity"
                        >
                          Reject Payment
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

      {/* Completed Payment Records */}
      <div className="bg-card rounded-lg border overflow-hidden">
        <div className="px-3 py-2 border-b bg-muted/30">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Completed Payment Records</h3>
        </div>
        {!completedDeposits?.length ? (
          <div className="text-center py-10 text-muted-foreground text-xs">No completed deposits</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b bg-muted/30">
                  <th className="text-left px-3 py-2 font-semibold text-muted-foreground">#</th>
                  <th className="text-left px-3 py-2 font-semibold text-muted-foreground">User ID</th>
                  <th className="text-left px-3 py-2 font-semibold text-muted-foreground">Mobile</th>
                  <th className="text-left px-3 py-2 font-semibold text-muted-foreground">Reference Number</th>
                  <th className="text-right px-3 py-2 font-semibold text-muted-foreground">Amount</th>
                  <th className="text-left px-3 py-2 font-semibold text-muted-foreground">Order ID</th>
                  <th className="text-left px-3 py-2 font-semibold text-muted-foreground">Date</th>
                </tr>
              </thead>
              <tbody>
                {completedDeposits.map((dep: any, idx: number) => (
                  <tr key={dep.id} className="border-b last:border-0 table-row-hover">
                    <td className="px-3 py-2 text-muted-foreground">{idx + 1}</td>
                    <td className="px-3 py-2 font-mono">{dep.user_id.slice(0, 8)}</td>
                    <td className="px-3 py-2">{dep.users?.mobile || "—"}</td>
                    <td className="px-3 py-2 font-mono text-muted-foreground">{dep.utr || "—"}</td>
                    <td className="px-3 py-2 text-right font-semibold">₹{Number(dep.amount).toLocaleString("en-IN")}</td>
                    <td className="px-3 py-2 font-mono text-muted-foreground">{dep.id.slice(0, 8)}</td>
                    <td className="px-3 py-2 text-muted-foreground">{new Date(dep.created_at).toLocaleString("en-IN")}</td>
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