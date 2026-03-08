import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { remoteDb } from "@/lib/remoteDb";
import { UserCheck, Plus, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

export default function AgentUserPage() {
  const queryClient = useQueryClient();
  const [userId, setUserId] = useState("");
  const [salary, setSalary] = useState("");
  const [salaryType, setSalaryType] = useState("month");

  const { data: agents, isLoading } = useQuery({
    queryKey: ["agents"],
    queryFn: () => remoteDb("get_agents"),
  });

  const addMutation = useMutation({
    mutationFn: () => remoteDb("add_agent", { userId, salary: Number(salary), salaryType }),
    onSuccess: () => { toast.success("Agent added!"); setUserId(""); setSalary(""); queryClient.invalidateQueries({ queryKey: ["agents"] }); },
    onError: (e: any) => toast.error("Error: " + e.message),
  });

  const removeMutation = useMutation({
    mutationFn: (uid: string) => remoteDb("remove_agent", { userId: uid }),
    onSuccess: () => { toast.success("Agent removed!"); queryClient.invalidateQueries({ queryKey: ["agents"] }); },
  });

  return (
    <div>
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'hsl(142, 71%, 45% / 0.12)', border: '1px solid hsl(142, 71%, 45% / 0.15)' }}>
          <UserCheck className="w-5 h-5" style={{ color: 'hsl(142, 71%, 50%)' }} />
        </div>
        <div>
          <h2 className="text-lg font-bold text-foreground font-display">Agent Users</h2>
          <p className="text-[11px] text-muted-foreground">Manage agent accounts & salary</p>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card-solid rounded-2xl p-6 mb-6">
        <h3 className="text-sm font-bold text-foreground font-display mb-4">Add Agent</h3>
        <div className="grid grid-cols-3 gap-4 mb-4 max-w-2xl">
          <div>
            <label className="block text-[10px] font-bold text-muted-foreground mb-2 uppercase tracking-[0.1em] font-display">User ID</label>
            <input type="text" value={userId} onChange={(e) => setUserId(e.target.value)} className="search-input !pl-4" placeholder="Enter UID" />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-muted-foreground mb-2 uppercase tracking-[0.1em] font-display">Salary (₹)</label>
            <input type="number" value={salary} onChange={(e) => setSalary(e.target.value)} className="search-input !pl-4" placeholder="Amount" />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-muted-foreground mb-2 uppercase tracking-[0.1em] font-display">Salary Type</label>
            <select value={salaryType} onChange={(e) => setSalaryType(e.target.value)} className="select-dark w-full h-[42px]">
              <option value="month">Monthly</option>
              <option value="week">Weekly</option>
              <option value="day">Daily</option>
            </select>
          </div>
        </div>
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => addMutation.mutate()} disabled={!userId || !salary || addMutation.isPending}
          className="btn-neon inline-flex items-center gap-2 px-5 py-2.5 text-[12px] font-display disabled:opacity-50">
          <Plus className="w-4 h-4" />
          {addMutation.isPending ? "Adding..." : "Add Agent"}
        </motion.button>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-table rounded-2xl overflow-hidden">
        <div className="px-5 py-3.5 flex items-center gap-2" style={{ borderBottom: '1px solid hsl(var(--border))', background: 'hsl(var(--card))' }}>
          <div className="w-2 h-2 rounded-full" style={{ background: 'hsl(142, 71%, 45%)' }} />
          <h3 className="text-[11px] font-bold text-muted-foreground uppercase tracking-[0.1em] font-display">Active Agents</h3>
        </div>
        {isLoading ? (
          <div className="flex items-center justify-center py-16"><Loader2 className="w-5 h-5 animate-spin text-primary" /></div>
        ) : !agents?.length ? (
          <div className="text-center py-16 text-muted-foreground text-sm">No agents</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="admin-table">
              <thead>
                <tr>
                  <th className="text-left">User ID</th>
                  <th className="text-left">Mobile</th>
                  <th className="text-right">Salary</th>
                  <th className="text-center">Type</th>
                  <th className="text-left">Added</th>
                  <th className="text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {agents.map((a: any) => (
                  <tr key={a.userid}>
                    <td className="font-mono text-foreground font-semibold">{a.userid}</td>
                    <td>{a.mobile}</td>
                    <td className="text-right font-bold text-foreground">₹{Number(a.salary).toLocaleString("en-IN")}</td>
                    <td className="text-center"><span className="badge-info">{a.type}</span></td>
                    <td className="text-muted-foreground">{a.created_at ? new Date(a.created_at).toLocaleString("en-IN") : "—"}</td>
                    <td className="text-center">
                      <button onClick={() => removeMutation.mutate(a.userid)} className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-[hsl(0,72%,51%/0.1)] transition-all mx-auto">
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
