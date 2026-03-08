import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Search, Loader2, ArrowDownToLine } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

export default function DepositUpdatePage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");

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
      toast.success("Deposit updated!");
      queryClient.invalidateQueries({ queryKey: ["deposits-pending"] });
      queryClient.invalidateQueries({ queryKey: ["deposits-completed"] });
    },
  });

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{
            background: 'hsl(142, 71%, 45% / 0.12)',
            border: '1px solid hsl(142, 71%, 45% / 0.15)',
          }}>
            <ArrowDownToLine className="w-5 h-5" style={{ color: 'hsl(142, 71%, 50%)' }} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white font-display">Deposit Update</h2>
            <p className="text-[11px] text-muted-foreground">Manage pending & completed deposits</p>
          </div>
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search UTR / Mobile..."
            className="search-input"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </motion.div>

      {/* Pending Payments */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-table rounded-2xl overflow-hidden mb-6"
      >
        <div className="px-5 py-3.5 flex items-center gap-2" style={{
          borderBottom: '1px solid hsl(225, 15%, 12%)',
          background: 'hsl(228, 22%, 8%)',
        }}>
          <div className="w-2 h-2 rounded-full" style={{ background: 'hsl(38, 92%, 50%)' }} />
          <h3 className="text-[11px] font-bold text-muted-foreground uppercase tracking-[0.1em] font-display">
            Pending Payments
          </h3>
        </div>
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-5 h-5 animate-spin" style={{ color: 'hsl(160, 84%, 45%)' }} />
          </div>
        ) : !pendingDeposits?.length ? (
          <div className="text-center py-16 text-muted-foreground text-sm">No pending deposits</div>
        ) : (
          <div className="overflow-x-auto">
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
                    <td className="font-mono text-white font-semibold">{dep.user_id.slice(0, 8)}</td>
                    <td>{dep.users?.mobile || "—"}</td>
                    <td className="font-mono text-muted-foreground">{dep.utr || "—"}</td>
                    <td className="text-right font-bold text-white">₹{Number(dep.amount).toLocaleString("en-IN")}</td>
                    <td className="font-mono text-muted-foreground">{dep.id.slice(0, 8)}</td>
                    <td className="text-muted-foreground">{new Date(dep.created_at).toLocaleString("en-IN")}</td>
                    <td>
                      <div className="flex items-center justify-center gap-2">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => statusMutation.mutate({ id: dep.id, status: "approved" })}
                          className="btn-neon px-3 py-1.5 text-[11px]"
                        >
                          Approve
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => statusMutation.mutate({ id: dep.id, status: "rejected" })}
                          className="btn-danger px-3 py-1.5 text-[11px]"
                        >
                          Reject
                        </motion.button>
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
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass-table rounded-2xl overflow-hidden"
      >
        <div className="px-5 py-3.5 flex items-center gap-2" style={{
          borderBottom: '1px solid hsl(225, 15%, 12%)',
          background: 'hsl(228, 22%, 8%)',
        }}>
          <div className="w-2 h-2 rounded-full" style={{ background: 'hsl(142, 71%, 45%)' }} />
          <h3 className="text-[11px] font-bold text-muted-foreground uppercase tracking-[0.1em] font-display">
            Completed Records
          </h3>
        </div>
        {!completedDeposits?.length ? (
          <div className="text-center py-16 text-muted-foreground text-sm">No completed deposits</div>
        ) : (
          <div className="overflow-x-auto">
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
                    <td className="font-mono text-white font-semibold">{dep.user_id.slice(0, 8)}</td>
                    <td>{dep.users?.mobile || "—"}</td>
                    <td className="font-mono text-muted-foreground">{dep.utr || "—"}</td>
                    <td className="text-right font-bold text-white">₹{Number(dep.amount).toLocaleString("en-IN")}</td>
                    <td className="font-mono text-muted-foreground">{dep.id.slice(0, 8)}</td>
                    <td className="text-center">
                      <span className={dep.status === "approved" ? "badge-success" : "badge-danger"}>
                        {dep.status}
                      </span>
                    </td>
                    <td className="text-muted-foreground">{new Date(dep.created_at).toLocaleString("en-IN")}</td>
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
