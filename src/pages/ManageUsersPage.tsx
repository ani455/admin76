import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Search, Ban, Eye, Edit, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function ManageUsersPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const perPage = 10;

  const { data, isLoading } = useQuery({
    queryKey: ["manage-users", search, page],
    queryFn: async () => {
      let query = supabase.from("users").select("*", { count: "exact" }).eq("is_demo", false).order("created_at", { ascending: false });

      if (search) {
        query = query.or(`name.ilike.%${search}%,mobile.ilike.%${search}%`);
      }

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
    onSuccess: (newStatus) => {
      toast.success(`User ${newStatus === "banned" ? "banned" : "unbanned"}`);
      queryClient.invalidateQueries({ queryKey: ["manage-users"] });
    },
  });

  const users = data?.users || [];
  const totalCount = data?.total || 0;
  const totalPages = Math.ceil(totalCount / perPage);

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-extrabold text-foreground">Manage Users</h2>
          <p className="text-sm text-muted-foreground">{totalCount} total users</p>
        </div>
        <div className="flex items-center gap-2 bg-card border rounded-lg px-3 py-2 w-full sm:w-72">
          <Search className="w-4 h-4 text-muted-foreground" />
          <input type="text" placeholder="Search by name or mobile..." className="bg-transparent text-sm outline-none flex-1 placeholder:text-muted-foreground" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
        </div>
      </div>

      <div className="bg-card rounded-xl border overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            <p className="text-lg font-semibold">No users found</p>
            <p className="text-sm mt-1">Users will appear here once they register</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-secondary/50">
                    <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Name</th>
                    <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Mobile</th>
                    <th className="text-right px-4 py-3 font-semibold text-muted-foreground">Balance</th>
                    <th className="text-right px-4 py-3 font-semibold text-muted-foreground">Total Recharge</th>
                    <th className="text-right px-4 py-3 font-semibold text-muted-foreground">Total Withdraw</th>
                    <th className="text-center px-4 py-3 font-semibold text-muted-foreground">Status</th>
                    <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Joined</th>
                    <th className="text-center px-4 py-3 font-semibold text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user, idx) => (
                    <tr key={user.id} className="border-b last:border-0 hover:bg-secondary/30 transition-colors animate-fade-in" style={{ animationDelay: `${idx * 40}ms` }}>
                      <td className="px-4 py-3 font-medium text-card-foreground">{user.name || "—"}</td>
                      <td className="px-4 py-3 text-muted-foreground font-mono text-xs">{user.mobile}</td>
                      <td className="px-4 py-3 text-right font-semibold text-card-foreground">₹{Number(user.balance).toLocaleString("en-IN")}</td>
                      <td className="px-4 py-3 text-right" style={{ color: "hsl(var(--stat-green))" }}>₹{Number(user.total_recharge).toLocaleString("en-IN")}</td>
                      <td className="px-4 py-3 text-right" style={{ color: "hsl(var(--stat-orange))" }}>₹{Number(user.total_withdraw).toLocaleString("en-IN")}</td>
                      <td className="px-4 py-3 text-center">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold" style={{
                          background: user.status === "active" ? "hsl(var(--stat-green) / 0.1)" : "hsl(var(--stat-red) / 0.1)",
                          color: user.status === "active" ? "hsl(var(--stat-green))" : "hsl(var(--stat-red))",
                        }}>
                          {user.status === "active" ? "Active" : "Banned"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground text-xs">{new Date(user.created_at).toLocaleDateString("en-IN")}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-1">
                          <button className="w-7 h-7 rounded-md flex items-center justify-center hover:bg-secondary transition-colors" title="View"><Eye className="w-3.5 h-3.5 text-muted-foreground" /></button>
                          <button onClick={() => banMutation.mutate({ id: user.id, status: user.status })} className="w-7 h-7 rounded-md flex items-center justify-center hover:bg-destructive/10 transition-colors" title={user.status === "active" ? "Ban" : "Unban"}>
                            <Ban className="w-3.5 h-3.5 text-destructive" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
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
