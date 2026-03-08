import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { remoteDb } from "@/lib/remoteDb";
import { Wifi, Search, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

export default function CheckIpPage() {
  const [search, setSearch] = useState("");

  const { data: results, isLoading } = useQuery({
    queryKey: ["check-ip", search],
    queryFn: () => remoteDb("check_same_ip", { ip: search || undefined }),
  });

  return (
    <div>
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'hsl(199, 89%, 48% / 0.12)', border: '1px solid hsl(199, 89%, 48% / 0.15)' }}>
            <Wifi className="w-5 h-5" style={{ color: 'hsl(199, 89%, 55%)' }} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-foreground font-display">Check Same IP</h2>
            <p className="text-[11px] text-muted-foreground">Find users sharing same IP address</p>
          </div>
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input type="text" placeholder="Filter by IP..." className="search-input" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-table rounded-2xl overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-20"><Loader2 className="w-5 h-5 animate-spin text-primary" /></div>
        ) : !results?.length ? (
          <div className="text-center py-20 text-muted-foreground text-sm">No duplicate IPs found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="admin-table">
              <thead>
                <tr>
                  <th className="text-left">IP Address</th>
                  <th className="text-center">User Count</th>
                  <th className="text-left">User IDs</th>
                  <th className="text-left">Mobiles</th>
                </tr>
              </thead>
              <tbody>
                {results.map((r: any, idx: number) => (
                  <tr key={idx}>
                    <td className="font-mono text-foreground font-semibold">{r.ip_address}</td>
                    <td className="text-center"><span className="badge-warning">{r.user_count}</span></td>
                    <td className="font-mono text-muted-foreground text-[11px]">{r.user_ids?.split(",").slice(0, 5).join(", ")}{r.user_count > 5 ? "..." : ""}</td>
                    <td className="text-muted-foreground text-[11px]">{r.mobiles?.split(",").slice(0, 5).join(", ")}{r.user_count > 5 ? "..." : ""}</td>
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
