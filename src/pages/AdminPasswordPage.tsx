import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { remoteDb } from "@/lib/remoteDb";
import { KeyRound, Save } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

export default function AdminPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const mutation = useMutation({
    mutationFn: () => remoteDb("change_admin_password", { newPassword: password }),
    onSuccess: () => { toast.success("Admin password updated!"); setPassword(""); setConfirm(""); },
    onError: (e: any) => toast.error("Error: " + e.message),
  });

  const handleSubmit = () => {
    if (password !== confirm) { toast.error("Passwords don't match!"); return; }
    if (password.length < 4) { toast.error("Password too short!"); return; }
    mutation.mutate();
  };

  return (
    <div>
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'hsl(38, 92%, 50% / 0.12)', border: '1px solid hsl(38, 92%, 50% / 0.15)' }}>
          <KeyRound className="w-5 h-5" style={{ color: 'hsl(38, 92%, 55%)' }} />
        </div>
        <div>
          <h2 className="text-lg font-bold text-foreground font-display">Admin Password</h2>
          <p className="text-[11px] text-muted-foreground">Change remote admin panel password</p>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card-solid rounded-2xl p-6 lg:p-8 max-w-md">
        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-[10px] font-bold text-muted-foreground mb-2 uppercase tracking-[0.1em] font-display">New Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="search-input !pl-4" placeholder="New password" />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-muted-foreground mb-2 uppercase tracking-[0.1em] font-display">Confirm Password</label>
            <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} className="search-input !pl-4" placeholder="Confirm password" />
          </div>
        </div>
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleSubmit} disabled={!password || !confirm || mutation.isPending}
          className="btn-neon inline-flex items-center gap-2.5 px-6 py-3 text-[13px] font-display disabled:opacity-50">
          <Save className="w-4 h-4" />
          {mutation.isPending ? "Updating..." : "Update Password"}
        </motion.button>
      </motion.div>
    </div>
  );
}
