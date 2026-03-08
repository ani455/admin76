import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { remoteDb } from "@/lib/remoteDb";
import { HelpCircle, Loader2, Send } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

const titleMap: Record<string, string> = {
  deposit: "Deposit Problem",
  withdrawal: "Withdrawal Problem",
  ifsc: "IFSC Modification",
  bank: "Bank Modification",
  game: "Game Problem",
};

export default function SupportPage() {
  const { type } = useParams<{ type: string }>();
  const queryClient = useQueryClient();
  const title = titleMap[type || ""] || "Support";

  const { data: queries, isLoading } = useQuery({
    queryKey: ["support-queries", type],
    queryFn: () => remoteDb("get_support_queries", { type }),
  });

  const [respondId, setRespondId] = useState<number | null>(null);
  const [remarks, setRemarks] = useState("");

  const respondMutation = useMutation({
    mutationFn: () => remoteDb("respond_support", { id: respondId, remarks }),
    onSuccess: () => { toast.success("Response sent!"); setRespondId(null); setRemarks(""); queryClient.invalidateQueries({ queryKey: ["support-queries", type] }); },
    onError: (e: any) => toast.error("Error: " + e.message),
  });

  return (
    <div>
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'hsl(38, 92%, 50% / 0.12)', border: '1px solid hsl(38, 92%, 50% / 0.15)' }}>
          <HelpCircle className="w-5 h-5" style={{ color: 'hsl(38, 92%, 55%)' }} />
        </div>
        <div>
          <h2 className="text-lg font-bold text-foreground font-display">{title}</h2>
          <p className="text-[11px] text-muted-foreground">Manage support queries</p>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-table rounded-2xl overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-20"><Loader2 className="w-5 h-5 animate-spin text-primary" /></div>
        ) : !queries?.length ? (
          <div className="text-center py-20 text-muted-foreground text-sm">No queries found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="admin-table">
              <thead>
                <tr>
                  <th className="text-left">ID</th>
                  <th className="text-left">User ID</th>
                  <th className="text-left">Order No</th>
                  <th className="text-right">Amount</th>
                  <th className="text-left">Message</th>
                  <th className="text-left">Remarks</th>
                  <th className="text-center">Status</th>
                  <th className="text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {queries.map((q: any) => (
                  <tr key={q.id}>
                    <td className="text-muted-foreground">{q.id}</td>
                    <td className="font-mono text-foreground font-semibold">{q.userid}</td>
                    <td className="font-mono text-muted-foreground">{q.order_no || "—"}</td>
                    <td className="text-right font-bold text-foreground">{q.amount ? `₹${Number(q.amount).toLocaleString("en-IN")}` : "—"}</td>
                    <td className="text-muted-foreground max-w-[200px] truncate">{q.message || "—"}</td>
                    <td className="text-muted-foreground max-w-[150px] truncate">{q.remarks || "—"}</td>
                    <td className="text-center">
                      <span className={q.status === 1 ? "badge-success" : "badge-warning"}>{q.status === 1 ? "Resolved" : "Pending"}</span>
                    </td>
                    <td className="text-center">
                      {q.status !== 1 && (
                        <button onClick={() => { setRespondId(q.id); setRemarks(q.remarks || ""); }}
                          className="btn-neon px-3 py-1.5 text-[11px] inline-flex items-center gap-1">
                          <Send className="w-3 h-3" /> Reply
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>

      {/* Reply Modal */}
      {respondId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setRespondId(null)}>
          <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            className="glass-card-solid rounded-2xl p-6 max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-sm font-bold text-foreground font-display mb-4">Send Response</h3>
            <textarea value={remarks} onChange={(e) => setRemarks(e.target.value)} rows={4}
              className="search-input !pl-4 mb-4 resize-none" placeholder="Type your response..." />
            <div className="flex gap-3">
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => respondMutation.mutate()} disabled={!remarks || respondMutation.isPending}
                className="btn-neon px-5 py-2.5 text-[12px] font-display disabled:opacity-50">
                {respondMutation.isPending ? "Sending..." : "Send"}
              </motion.button>
              <button onClick={() => setRespondId(null)} className="px-5 py-2.5 text-[12px] text-muted-foreground hover:text-foreground">Cancel</button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
