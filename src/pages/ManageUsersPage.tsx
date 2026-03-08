import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Search, Ban, Eye, ChevronLeft, ChevronRight, Loader2, Users } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

export default function ManageUsersPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const perPage = 50;

  const { data, isLoading } = useQuery({
    queryKey: ["manage-users", search, page],
    queryFn: async () => {
      let query = supabase.from("users").select("*", { count: "exact" }).eq("is_demo", false).order("created_at", { ascending: false });
      if (search) query = query.or(`name.ilike.%${search}%,mobile.ilike.%${search}%,referral_code.ilike.%${search}%,ip_address.ilike.%${search}%`);
      query = query.range((page - 1) * perPage, page * perPage - 1);
      const { data, count, error } = await query;
      if (error) throw error;
      return { users: data || [], total: count || 0 };
    },
  });

  const banMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const newStatus = status === "active" ? "banned" : "active";
      const { error } = await supabase.from("users").update({ status: newStatus }).eq("id", id);
      if (error) throw error;
      return newStatus;
    },
    onSuccess: (s) => { toast.success(`User ${s === "banned" ? "banned" : "unbanned"}`); queryClient.invalidateQueries({ queryKey: ["manage-users"] }); },
  });

  const users = data?.users || [];
  const totalCount = data?.total || 0;
  const totalPages = Math.ceil(totalCount / perPage);

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{
            background: 'hsl(220, 90%, 56% / 0.12)',
            border: '1px solid hsl(220, 90%, 56% / 0.15)',
          }}>
            <Users className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-foreground font-display">Manage Users</h2>
            <p className="text-[11px] text-muted-foreground">{totalCount} total users</p>
          </div>
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search mobile, name, IP, refer code..."
            className="search-input"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-table rounded-2xl overflow-hidden"
      >
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-5 h-5 animate-spin text-primary" />
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground text-sm">No users found</div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th className="text-left">Mobile</th>
                    <th className="text-left">Refer Code</th>
                    <th className="text-left">IP Address</th>
                    <th className="text-left">Cust ID</th>
                    <th className="text-right">Wallet</th>
                    <th className="text-right">Recharge</th>
                    <th className="text-left">Reg. Date</th>
                    <th className="text-center">Action</th>
                    <th className="text-left">Name</th>
                    <th className="text-center">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user, i) => (
                    <motion.tr
                      key={user.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.015 }}
                    >
                      <td className="font-mono font-semibold text-foreground">{user.mobile}</td>
                      <td className="text-muted-foreground">{user.referral_code || "—"}</td>
                      <td className="font-mono text-muted-foreground">{user.ip_address || "—"}</td>
                      <td className="font-mono text-muted-foreground">{user.id.slice(0, 8)}</td>
                      <td className="text-right font-bold text-foreground">₹{Number(user.balance).toLocaleString("en-IN")}</td>
                      <td className="text-right font-medium text-success">₹{Number(user.total_recharge).toLocaleString("en-IN")}</td>
                      <td className="text-muted-foreground">{new Date(user.created_at).toLocaleDateString("en-IN")}</td>
                      <td className="text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-[hsl(225,15%,16%)] transition-all" title="View">
                            <Eye className="w-3.5 h-3.5 text-muted-foreground" />
                          </button>
                          <button
                            onClick={() => banMutation.mutate({ id: user.id, status: user.status })}
                            className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-[hsl(0,72%,51%/0.1)] transition-all"
                            title={user.status === "active" ? "Ban" : "Unban"}
                          >
                            <Ban className="w-3.5 h-3.5" style={{ color: 'hsl(0, 72%, 55%)' }} />
                          </button>
                        </div>
                      </td>
                      <td>{user.name || "—"}</td>
                      <td className="text-center">
                        <span className={user.status === "banned" ? "badge-danger" : "badge-success"}>
                          {user.status === "banned" ? "Banned" : "Active"}
                        </span>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3" style={{
                borderTop: '1px solid hsl(225, 15%, 12%)',
                background: 'hsl(228, 22%, 8%)',
              }}>
                <p className="text-[11px] text-muted-foreground font-medium">
                  {(page - 1) * perPage + 1}–{Math.min(page * perPage, totalCount)} of {totalCount}
                </p>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-white hover:bg-[hsl(225,15%,14%)] transition-all disabled:opacity-30"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="px-3 text-[11px] font-bold text-muted-foreground font-mono">
                    {page}/{totalPages}
                  </span>
                  <button
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page >= totalPages}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-white hover:bg-[hsl(225,15%,14%)] transition-all disabled:opacity-30"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </motion.div>
    </div>
  );
}
