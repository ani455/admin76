import { useQuery } from "@tanstack/react-query";
import { remoteDb } from "@/lib/remoteDb";
import { CheckCircle, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

export default function WithdrawSentPage() {
  const { data: withdrawals, isLoading } = useQuery({
    queryKey: ["withdraw-sent"],
    queryFn: () => remoteDb("get_withdraw_sent"),
  });

  return (
    <div>
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'hsl(142, 71%, 45% / 0.12)', border: '1px solid hsl(142, 71%, 45% / 0.15)' }}>
          <CheckCircle className="w-5 h-5" style={{ color: 'hsl(142, 71%, 50%)' }} />
        </div>
        <div>
          <h2 className="text-lg font-bold text-foreground font-display">Withdraw Sent</h2>
          <p className="text-[11px] text-muted-foreground">Approved & sent withdrawals</p>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-table rounded-2xl overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-20"><Loader2 className="w-5 h-5 animate-spin text-primary" /></div>
        ) : !withdrawals?.length ? (
          <div className="text-center py-20 text-muted-foreground text-sm">No sent withdrawals</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="admin-table">
              <thead>
                <tr>
                  <th className="text-left">#</th>
                  <th className="text-left">Mobile</th>
                  <th className="text-right">Amount</th>
                  <th className="text-left">Bank</th>
                  <th className="text-left">Account No</th>
                  <th className="text-left">IFSC</th>
                  <th className="text-left">Remark</th>
                  <th className="text-left">Date</th>
                </tr>
              </thead>
              <tbody>
                {withdrawals.map((w: any, idx: number) => (
                  <tr key={w.id}>
                    <td className="text-muted-foreground">{idx + 1}</td>
                    <td className="text-foreground font-semibold">{w.user_mobile || "—"}</td>
                    <td className="text-right font-bold text-foreground">₹{Number(w.amount).toLocaleString("en-IN")}</td>
                    <td>{w.bank_name || "—"}</td>
                    <td className="font-mono">{w.account_no || "—"}</td>
                    <td className="font-mono text-muted-foreground">{w.ifsc || "—"}</td>
                    <td className="text-muted-foreground">{w.remark || "—"}</td>
                    <td className="text-muted-foreground">{new Date(w.created_at).toLocaleString("en-IN")}</td>
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
