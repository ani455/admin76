import { useState } from "react";
import { Search, CheckCircle, XCircle, Clock, Eye, ChevronLeft, ChevronRight } from "lucide-react";

const mockDeposits = Array.from({ length: 20 }, (_, i) => ({
  id: 1000 + i,
  user: `User${9800 + i}`,
  mobile: `+91 ${9800000000 + i * 111}`,
  amount: [500, 1000, 2000, 5000, 10000, 15000, 20000, 50000][i % 8],
  method: ["UPI", "USDT", "Bank Transfer"][i % 3],
  utr: `UTR${Math.floor(Math.random() * 9999999999)}`,
  status: i < 5 ? "Pending" : i < 15 ? "Approved" : "Rejected",
  date: new Date(2026, 2, Math.floor(Math.random() * 8) + 1).toLocaleDateString("en-IN") + " " + `${Math.floor(Math.random() * 12) + 1}:${String(Math.floor(Math.random() * 60)).padStart(2, "0")} PM`,
}));

export default function DepositUpdatePage() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [page, setPage] = useState(1);
  const perPage = 10;

  const filtered = mockDeposits.filter((d) => {
    const matchSearch = d.user.toLowerCase().includes(search.toLowerCase()) || d.utr.includes(search);
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
          <h2 className="text-2xl font-extrabold text-foreground">Deposit Update</h2>
          <p className="text-sm text-muted-foreground">Manage all deposit requests</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 bg-card border rounded-lg px-3 py-2 w-full sm:w-60">
            <Search className="w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search UTR or user..."
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

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: "Pending", count: mockDeposits.filter((d) => d.status === "Pending").length, color: "amber", icon: Clock },
          { label: "Approved", count: mockDeposits.filter((d) => d.status === "Approved").length, color: "green", icon: CheckCircle },
          { label: "Rejected", count: mockDeposits.filter((d) => d.status === "Rejected").length, color: "red", icon: XCircle },
        ].map((s, idx) => (
          <div
            key={s.label}
            className="bg-card rounded-xl border p-4 flex items-center gap-3 animate-slide-up"
            style={{ animationDelay: `${idx * 80}ms` }}
          >
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ background: `hsl(var(--stat-${s.color}) / 0.1)` }}
            >
              <s.icon className="w-5 h-5" style={{ color: `hsl(var(--stat-${s.color}))` }} />
            </div>
            <div>
              <p className="text-2xl font-extrabold text-card-foreground">{s.count}</p>
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
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Method</th>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground">UTR</th>
                <th className="text-center px-4 py-3 font-semibold text-muted-foreground">Status</th>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Date</th>
                <th className="text-center px-4 py-3 font-semibold text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paged.map((dep, idx) => (
                <tr
                  key={dep.id}
                  className="border-b last:border-0 hover:bg-secondary/30 transition-colors animate-fade-in"
                  style={{ animationDelay: `${idx * 30}ms` }}
                >
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">#{dep.id}</td>
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-medium text-card-foreground">{dep.user}</p>
                      <p className="text-xs text-muted-foreground">{dep.mobile}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right font-bold text-card-foreground">₹{dep.amount.toLocaleString("en-IN")}</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-secondary text-secondary-foreground">
                      {dep.method}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{dep.utr}</td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold"
                      style={{
                        background: `hsl(var(--${statusColors[dep.status]}) / 0.1)`,
                        color: `hsl(var(--${statusColors[dep.status]}))`,
                      }}
                    >
                      {dep.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{dep.date}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-1">
                      {dep.status === "Pending" && (
                        <>
                          <button
                            className="w-7 h-7 rounded-md flex items-center justify-center transition-colors"
                            style={{ background: "hsl(var(--stat-green) / 0.1)" }}
                            title="Approve"
                          >
                            <CheckCircle className="w-3.5 h-3.5" style={{ color: "hsl(var(--stat-green))" }} />
                          </button>
                          <button
                            className="w-7 h-7 rounded-md flex items-center justify-center transition-colors"
                            style={{ background: "hsl(var(--stat-red) / 0.1)" }}
                            title="Reject"
                          >
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
          <p className="text-xs text-muted-foreground">
            Showing {(page - 1) * perPage + 1}–{Math.min(page * perPage, filtered.length)} of {filtered.length}
          </p>
          <div className="flex items-center gap-1">
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="w-8 h-8 rounded-md flex items-center justify-center bg-card border hover:bg-secondary disabled:opacity-40 transition-colors">
              <ChevronLeft className="w-4 h-4" />
            </button>
            {Array.from({ length: total }, (_, i) => (
              <button key={i} onClick={() => setPage(i + 1)} className={`w-8 h-8 rounded-md flex items-center justify-center text-xs font-medium transition-colors ${page === i + 1 ? "bg-primary text-primary-foreground" : "bg-card border hover:bg-secondary"}`}>
                {i + 1}
              </button>
            ))}
            <button onClick={() => setPage((p) => Math.min(total, p + 1))} disabled={page === total} className="w-8 h-8 rounded-md flex items-center justify-center bg-card border hover:bg-secondary disabled:opacity-40 transition-colors">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
