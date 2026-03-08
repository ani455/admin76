import { useState } from "react";
import { Search, CheckCircle, XCircle, Clock, Eye, ChevronLeft, ChevronRight, Copy } from "lucide-react";

const mockWithdrawals = Array.from({ length: 18 }, (_, i) => ({
  id: 2000 + i,
  user: `User${7700 + i}`,
  mobile: `+91 ${9700000000 + i * 222}`,
  amount: [1000, 2000, 5000, 10000, 15000, 20000, 25000, 50000][i % 8],
  bankName: ["SBI", "HDFC", "ICICI", "Axis Bank", "PNB", "BOI"][i % 6],
  accountNo: `****${String(1234 + i * 111).slice(-4)}`,
  ifsc: `SBIN00${String(10000 + i).slice(-5)}`,
  status: i < 6 ? "Pending" : i < 14 ? "Approved" : "Rejected",
  date: new Date(2026, 2, Math.floor(Math.random() * 8) + 1).toLocaleDateString("en-IN"),
}));

export default function WithdrawManagePage() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [page, setPage] = useState(1);
  const perPage = 10;

  const filtered = mockWithdrawals.filter((d) => {
    const matchSearch = d.user.toLowerCase().includes(search.toLowerCase()) || d.accountNo.includes(search);
    const matchFilter = filter === "all" || d.status.toLowerCase() === filter;
    return matchSearch && matchFilter;
  });
  const total = Math.ceil(filtered.length / perPage);
  const paged = filtered.slice((page - 1) * perPage, page * perPage);

  const statusColors: Record<string, string> = {
    Pending: "stat-amber",
    Approved: "stat-green",
    Rejected: "stat-red",
  };

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-extrabold text-foreground">Withdraw Requests</h2>
          <p className="text-sm text-muted-foreground">Manage withdrawal applications</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 bg-card border rounded-lg px-3 py-2 w-full sm:w-60">
            <Search className="w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search..."
              className="bg-transparent text-sm outline-none flex-1 placeholder:text-muted-foreground"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            />
          </div>
          <select
            value={filter}
            onChange={(e) => { setFilter(e.target.value); setPage(1); }}
            className="h-10 rounded-lg bg-card border px-3 text-sm outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="all">All</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: "Pending", value: `₹${mockWithdrawals.filter(d => d.status === "Pending").reduce((s, d) => s + d.amount, 0).toLocaleString("en-IN")}`, color: "amber", icon: Clock },
          { label: "Approved", value: `₹${mockWithdrawals.filter(d => d.status === "Approved").reduce((s, d) => s + d.amount, 0).toLocaleString("en-IN")}`, color: "green", icon: CheckCircle },
          { label: "Rejected", value: `₹${mockWithdrawals.filter(d => d.status === "Rejected").reduce((s, d) => s + d.amount, 0).toLocaleString("en-IN")}`, color: "red", icon: XCircle },
        ].map((s, idx) => (
          <div key={s.label} className="bg-card rounded-xl border p-4 flex items-center gap-3 animate-slide-up" style={{ animationDelay: `${idx * 80}ms` }}>
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: `hsl(var(--stat-${s.color}) / 0.1)` }}>
              <s.icon className="w-5 h-5" style={{ color: `hsl(var(--stat-${s.color}))` }} />
            </div>
            <div>
              <p className="text-lg font-extrabold text-card-foreground">{s.value}</p>
              <p className="text-xs text-muted-foreground font-medium">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-card rounded-xl border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-secondary/50">
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground">ID</th>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground">User</th>
                <th className="text-right px-4 py-3 font-semibold text-muted-foreground">Amount</th>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Bank</th>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Account</th>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground">IFSC</th>
                <th className="text-center px-4 py-3 font-semibold text-muted-foreground">Status</th>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Date</th>
                <th className="text-center px-4 py-3 font-semibold text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paged.map((w, idx) => (
                <tr key={w.id} className="border-b last:border-0 hover:bg-secondary/30 transition-colors animate-fade-in" style={{ animationDelay: `${idx * 30}ms` }}>
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">#{w.id}</td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-card-foreground">{w.user}</p>
                    <p className="text-xs text-muted-foreground">{w.mobile}</p>
                  </td>
                  <td className="px-4 py-3 text-right font-bold text-card-foreground">₹{w.amount.toLocaleString("en-IN")}</td>
                  <td className="px-4 py-3 text-card-foreground">{w.bankName}</td>
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground flex items-center gap-1">
                    {w.accountNo}
                    <button className="hover:text-primary transition-colors"><Copy className="w-3 h-3" /></button>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{w.ifsc}</td>
                  <td className="px-4 py-3 text-center">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold" style={{ background: `hsl(var(--${statusColors[w.status]}) / 0.1)`, color: `hsl(var(--${statusColors[w.status]}))` }}>
                      {w.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{w.date}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-1">
                      {w.status === "Pending" && (
                        <>
                          <button className="w-7 h-7 rounded-md flex items-center justify-center transition-colors" style={{ background: "hsl(var(--stat-green) / 0.1)" }} title="Approve">
                            <CheckCircle className="w-3.5 h-3.5" style={{ color: "hsl(var(--stat-green))" }} />
                          </button>
                          <button className="w-7 h-7 rounded-md flex items-center justify-center transition-colors" style={{ background: "hsl(var(--stat-red) / 0.1)" }} title="Reject">
                            <XCircle className="w-3.5 h-3.5" style={{ color: "hsl(var(--stat-red))" }} />
                          </button>
                        </>
                      )}
                      <button className="w-7 h-7 rounded-md flex items-center justify-center hover:bg-secondary transition-colors" title="View">
                        <Eye className="w-3.5 h-3.5 text-muted-foreground" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between px-4 py-3 border-t bg-secondary/30">
          <p className="text-xs text-muted-foreground">Showing {(page - 1) * perPage + 1}–{Math.min(page * perPage, filtered.length)} of {filtered.length}</p>
          <div className="flex items-center gap-1">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="w-8 h-8 rounded-md flex items-center justify-center bg-card border hover:bg-secondary disabled:opacity-40 transition-colors"><ChevronLeft className="w-4 h-4" /></button>
            {Array.from({ length: total }, (_, i) => (
              <button key={i} onClick={() => setPage(i + 1)} className={`w-8 h-8 rounded-md flex items-center justify-center text-xs font-medium transition-colors ${page === i + 1 ? "bg-primary text-primary-foreground" : "bg-card border hover:bg-secondary"}`}>{i + 1}</button>
            ))}
            <button onClick={() => setPage(p => Math.min(total, p + 1))} disabled={page === total} className="w-8 h-8 rounded-md flex items-center justify-center bg-card border hover:bg-secondary disabled:opacity-40 transition-colors"><ChevronRight className="w-4 h-4" /></button>
          </div>
        </div>
      </div>
    </div>
  );
}
