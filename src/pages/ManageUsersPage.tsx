import { useState } from "react";
import { Search, MoreHorizontal, Ban, Eye, Edit, ChevronLeft, ChevronRight } from "lucide-react";

const mockUsers = Array.from({ length: 25 }, (_, i) => ({
  id: i + 1,
  mobile: `+91 ${9800000000 + Math.floor(Math.random() * 99999999)}`,
  name: ["Rahul Kumar", "Amit Singh", "Priya Sharma", "Neha Gupta", "Vijay Patel", "Sanjay Verma", "Anjali Rao", "Deepak Joshi"][i % 8],
  balance: (Math.random() * 50000).toFixed(2),
  totalRecharge: (Math.random() * 200000).toFixed(0),
  totalWithdraw: (Math.random() * 150000).toFixed(0),
  status: Math.random() > 0.15 ? "Active" : "Banned",
  joinDate: new Date(2024, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1).toLocaleDateString("en-IN"),
}));

export default function ManageUsersPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const perPage = 10;

  const filtered = mockUsers.filter(
    (u) => u.name.toLowerCase().includes(search.toLowerCase()) || u.mobile.includes(search)
  );
  const total = Math.ceil(filtered.length / perPage);
  const paged = filtered.slice((page - 1) * perPage, page * perPage);

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-extrabold text-foreground">Manage Users</h2>
          <p className="text-sm text-muted-foreground">{mockUsers.length} total users</p>
        </div>
        <div className="flex items-center gap-2 bg-card border rounded-lg px-3 py-2 w-full sm:w-72">
          <Search className="w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by name or mobile..."
            className="bg-transparent text-sm outline-none flex-1 placeholder:text-muted-foreground"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
      </div>

      <div className="bg-card rounded-xl border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-secondary/50">
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground">#</th>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Name</th>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Mobile</th>
                <th className="text-right px-4 py-3 font-semibold text-muted-foreground">Balance</th>
                <th className="text-right px-4 py-3 font-semibold text-muted-foreground">Total Recharge</th>
                <th className="text-right px-4 py-3 font-semibold text-muted-foreground">Total Withdraw</th>
                <th className="text-center px-4 py-3 font-semibold text-muted-foreground">Status</th>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Joined</th>
                <th className="text-center px-4 py-3 font-semibold text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paged.map((user, idx) => (
                <tr
                  key={user.id}
                  className="border-b last:border-0 hover:bg-secondary/30 transition-colors animate-fade-in"
                  style={{ animationDelay: `${idx * 40}ms` }}
                >
                  <td className="px-4 py-3 text-muted-foreground">{user.id}</td>
                  <td className="px-4 py-3 font-medium text-card-foreground">{user.name}</td>
                  <td className="px-4 py-3 text-muted-foreground font-mono text-xs">{user.mobile}</td>
                  <td className="px-4 py-3 text-right font-semibold text-card-foreground">₹{Number(user.balance).toLocaleString("en-IN")}</td>
                  <td className="px-4 py-3 text-right" style={{ color: "hsl(var(--stat-green))" }}>₹{Number(user.totalRecharge).toLocaleString("en-IN")}</td>
                  <td className="px-4 py-3 text-right" style={{ color: "hsl(var(--stat-orange))" }}>₹{Number(user.totalWithdraw).toLocaleString("en-IN")}</td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold"
                      style={{
                        background: user.status === "Active" ? "hsl(var(--stat-green) / 0.1)" : "hsl(var(--stat-red) / 0.1)",
                        color: user.status === "Active" ? "hsl(var(--stat-green))" : "hsl(var(--stat-red))",
                      }}
                    >
                      {user.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground text-xs">{user.joinDate}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-1">
                      <button className="w-7 h-7 rounded-md flex items-center justify-center hover:bg-secondary transition-colors" title="View">
                        <Eye className="w-3.5 h-3.5 text-muted-foreground" />
                      </button>
                      <button className="w-7 h-7 rounded-md flex items-center justify-center hover:bg-secondary transition-colors" title="Edit">
                        <Edit className="w-3.5 h-3.5 text-muted-foreground" />
                      </button>
                      <button className="w-7 h-7 rounded-md flex items-center justify-center hover:bg-destructive/10 transition-colors" title="Ban">
                        <Ban className="w-3.5 h-3.5 text-destructive" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-4 py-3 border-t bg-secondary/30">
          <p className="text-xs text-muted-foreground">
            Showing {(page - 1) * perPage + 1}–{Math.min(page * perPage, filtered.length)} of {filtered.length}
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="w-8 h-8 rounded-md flex items-center justify-center bg-card border hover:bg-secondary disabled:opacity-40 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            {Array.from({ length: total }, (_, i) => (
              <button
                key={i}
                onClick={() => setPage(i + 1)}
                className={`w-8 h-8 rounded-md flex items-center justify-center text-xs font-medium transition-colors ${
                  page === i + 1 ? "bg-primary text-primary-foreground" : "bg-card border hover:bg-secondary"
                }`}
              >
                {i + 1}
              </button>
            ))}
            <button
              onClick={() => setPage((p) => Math.min(total, p + 1))}
              disabled={page === total}
              className="w-8 h-8 rounded-md flex items-center justify-center bg-card border hover:bg-secondary disabled:opacity-40 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
