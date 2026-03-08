import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { remoteDb } from "@/lib/remoteDb";
import { Shield, Loader2, Unlock } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

export default function BanUsersPage() {
  const queryClient = useQueryClient();
  const { data: users, isLoading } = useQuery({
    queryKey: ["banned-users"],
    queryFn: () => remoteDb("get_banned_users"),
  });

  const unbanMutation = useMutation({
    mutationFn: (id: string) => remoteDb("ban_user", { id, status: "banned" }),
    onSuccess: () => { toast.success("User unbanned!"); queryClient.invalidateQueries({ queryKey: ["banned-users"] }); },
  });

  return (
    <div>
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'hsl(0, 72%, 51% / 0.12)', border: '1px solid hsl(0, 72%, 51% / 0.15)' }}>
          <Shield className="w-5 h-5" style={{ color: 'hsl(0, 72%, 55%)' }} />
        </div>
        <div>
          <h2 className="text-lg font-bold text-foreground font-display">Banned Users</h2>
          <p className="text-[11px] text-muted-foreground">View and manage frozen accounts</p>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-table rounded-2xl overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-20"><Loader2 className="w-5 h-5 animate-spin text-primary" /></div>
        ) : !users?.length ? (
          <div className="text-center py-20 text-muted-foreground text-sm">No banned users</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="admin-table">
              <thead>
                <tr>
                  <th className="text-left">User ID</th>
                  <th className="text-left">Mobile</th>
                  <th className="text-left">IP</th>
                  <th className="text-right">Balance</th>
                  <th className="text-left">Registered</th>
                  <th className="text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u: any) => (
                  <tr key={u.id}>
                    <td className="font-mono text-foreground font-semibold">{u.id}</td>
                    <td className="text-foreground">{u.mobile}</td>
                    <td className="font-mono text-muted-foreground">{u.ip_address || "—"}</td>
                    <td className="text-right font-bold text-foreground">₹{Number(u.balance).toLocaleString("en-IN")}</td>
                    <td className="text-muted-foreground">{new Date(u.created_at).toLocaleDateString("en-IN")}</td>
                    <td className="text-center">
                      <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                        onClick={() => unbanMutation.mutate(u.id)}
                        className="btn-neon px-3 py-1.5 text-[11px] inline-flex items-center gap-1.5">
                        <Unlock className="w-3 h-3" /> Unban
                      </motion.button>
                    </td>
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
