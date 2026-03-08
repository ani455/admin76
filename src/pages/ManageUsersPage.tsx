import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Search, Ban, Eye, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { toast } from "sonner";

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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <h2 className="text-lg font-bold text-foreground">Manage User</h2>
        <div className="flex items-center gap-2 bg-card border rounded-md px-3 py-1.5 w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search mobile, name, IP, refer code..."
            className="bg-transparent text-xs outline-none flex-1 placeholder:text-muted-foreground"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
      </div>

      <div className="bg-card rounded-lg border overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-5 h-5 animate-spin text-primary" />
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground text-sm">No users found</div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left px-3 py-2.5 font-semibold text-muted-foreground">Mobile</th>
                    <th className="text-left px-3 py-2.5 font-semibold text-muted-foreground">Refer Code</th>
                    <th className="text-left px-3 py-2.5 font-semibold text-muted-foreground">IP Address</th>
                    <th className="text-left px-3 py-2.5 font-semibold text-muted-foreground">Cust ID</th>
                    <th className="text-right px-3 py-2.5 font-semibold text-muted-foreground">Wallet</th>
                    <th className="text-right px-3 py-2.5 font-semibold text-muted-foreground">Recharge</th>
                    <th className="text-left px-3 py-2.5 font-semibold text-muted-foreground">Reg. Date</th>
                    <th className="text-center px-3 py-2.5 font-semibold text-muted-foreground">Action</th>
                    <th className="text-left px-3 py-2.5 font-semibold text-muted-foreground">Name</th>
                    <th className="text-center px-3 py-2.5 font-semibold text-muted-foreground">Is Frozen</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="border-b last:border-0 table-row-hover transition-colors">
                      <td className="px-3 py-2 font-mono">{user.mobile}</td>
                      <td className="px-3 py-2 text-muted-foreground">{user.referral_code || "—"}</td>
                      <td className="px-3 py-2 font-mono text-muted-foreground">{user.ip_address || "—"}</td>
                      <td className="px-3 py-2 font-mono text-muted-foreground">{user.id.slice(0, 8)}</td>
                      <td className="px-3 py-2 text-right font-semibold">₹{Number(user.balance).toLocaleString("en-IN")}</td>
                      <td className="px-3 py-2 text-right text-success font-medium">₹{Number(user.total_recharge).toLocaleString("en-IN")}</td>
                      <td className="px-3 py-2 text-muted-foreground">{new Date(user.created_at).toLocaleDateString("en-IN")}</td>
                      <td className="px-3 py-2 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button className="p-1 rounded hover:bg-muted transition-colors" title="View">
                            <Eye className="w-3.5 h-3.5 text-muted-foreground" />
                          </button>
                          <button
                            onClick={() => banMutation.mutate({ id: user.id, status: user.status })}
                            className="p-1 rounded hover:bg-destructive/10 transition-colors"
                            title={user.status === "active" ? "Ban" : "Unban"}
                          >
                            <Ban className="w-3.5 h-3.5 text-destructive" />
                          </button>
                        </div>
                      </td>
                      <td className="px-3 py-2">{user.name || "—"}</td>
                      <td className="px-3 py-2 text-center">
                        <span className={`inline-block w-2 h-2 rounded-full ${user.status === "banned" ? "bg-destructive" : "bg-success"}`} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-3 py-2 border-t bg-muted/30">
                <p className="text-[11px] text-muted-foreground">
                  {(page - 1) * perPage + 1}–{Math.min(page * perPage, totalCount)} of {totalCount}
                </p>
                <div className="flex items-center gap-0.5">
                  <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="w-7 h-7 rounded flex items-center justify-center bg-card border text-xs hover:bg-muted disabled:opacity-30">
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>
                  <span className="px-2 text-[11px] font-medium">{page}/{totalPages}</span>
                  <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages} className="w-7 h-7 rounded flex items-center justify-center bg-card border text-xs hover:bg-muted disabled:opacity-30">
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}