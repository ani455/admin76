import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { remoteDb } from "@/lib/remoteDb";
import { Bot, Plus, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

export default function DemoUserPage() {
  const queryClient = useQueryClient();
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");

  const { data: demoUsers, isLoading } = useQuery({
    queryKey: ["demo-users"],
    queryFn: () => remoteDb("get_demo_users"),
  });

  const addMutation = useMutation({
    mutationFn: () => remoteDb("add_demo_user", { mobile, password }),
    onSuccess: () => { toast.success("Demo user added!"); setMobile(""); setPassword(""); queryClient.invalidateQueries({ queryKey: ["demo-users"] }); },
    onError: (e: any) => toast.error("Error: " + e.message),
  });

  const removeMutation = useMutation({
    mutationFn: (userId: string) => remoteDb("remove_demo_user", { userId }),
    onSuccess: () => { toast.success("Demo user removed!"); queryClient.invalidateQueries({ queryKey: ["demo-users"] }); },
  });

  return (
    <div>
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'hsl(199, 89%, 48% / 0.12)', border: '1px solid hsl(199, 89%, 48% / 0.15)' }}>
          <Bot className="w-5 h-5" style={{ color: 'hsl(199, 89%, 55%)' }} />
        </div>
        <div>
          <h2 className="text-lg font-bold text-foreground font-display">Demo Users</h2>
          <p className="text-[11px] text-muted-foreground">Manage demo/test accounts</p>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card-solid rounded-2xl p-6 mb-6 max-w-lg">
        <h3 className="text-sm font-bold text-foreground font-display mb-4">Add Demo User</h3>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-[10px] font-bold text-muted-foreground mb-2 uppercase tracking-[0.1em] font-display">Mobile</label>
            <input type="text" value={mobile} onChange={(e) => setMobile(e.target.value)} className="search-input !pl-4" placeholder="Mobile number" />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-muted-foreground mb-2 uppercase tracking-[0.1em] font-display">Password</label>
            <input type="text" value={password} onChange={(e) => setPassword(e.target.value)} className="search-input !pl-4" placeholder="Password" />
          </div>
        </div>
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => addMutation.mutate()} disabled={!mobile || !password || addMutation.isPending}
          className="btn-neon inline-flex items-center gap-2 px-5 py-2.5 text-[12px] font-display disabled:opacity-50">
          <Plus className="w-4 h-4" />
          {addMutation.isPending ? "Adding..." : "Add Demo User"}
        </motion.button>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-table rounded-2xl overflow-hidden">
        <div className="px-5 py-3.5 flex items-center gap-2" style={{ borderBottom: '1px solid hsl(var(--border))', background: 'hsl(var(--card))' }}>
          <div className="w-2 h-2 rounded-full" style={{ background: 'hsl(199, 89%, 48%)' }} />
          <h3 className="text-[11px] font-bold text-muted-foreground uppercase tracking-[0.1em] font-display">Active Demo Users</h3>
        </div>
        {isLoading ? (
          <div className="flex items-center justify-center py-16"><Loader2 className="w-5 h-5 animate-spin text-primary" /></div>
        ) : !demoUsers?.length ? (
          <div className="text-center py-16 text-muted-foreground text-sm">No demo users</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="admin-table">
              <thead>
                <tr>
                  <th className="text-left">User ID</th>
                  <th className="text-left">Mobile</th>
                  <th className="text-right">Balance</th>
                  <th className="text-left">Created</th>
                  <th className="text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {demoUsers.map((u: any) => (
                  <tr key={u.user_id}>
                    <td className="font-mono text-foreground font-semibold">{u.user_id}</td>
                    <td>{u.mobile}</td>
                    <td className="text-right font-bold text-foreground">₹{Number(u.balance).toLocaleString("en-IN")}</td>
                    <td className="text-muted-foreground">{u.created_at ? new Date(u.created_at).toLocaleString("en-IN") : "—"}</td>
                    <td className="text-center">
                      <button onClick={() => removeMutation.mutate(u.user_id)} className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-[hsl(0,72%,51%/0.1)] transition-all mx-auto">
                        <Trash2 className="w-3.5 h-3.5" style={{ color: 'hsl(0, 72%, 55%)' }} />
                      </button>
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
