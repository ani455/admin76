import { useState } from "react";
import { Outlet } from "react-router-dom";
import AdminSidebar from "./AdminSidebar";
import { Menu, Shield } from "lucide-react";

export default function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      {mobileOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 lg:hidden" onClick={() => setMobileOpen(false)} />
      )}

      <div className="hidden lg:block">
        <AdminSidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
      </div>
      <div className={`lg:hidden ${mobileOpen ? "block" : "hidden"}`}>
        <AdminSidebar collapsed={false} onToggle={() => setMobileOpen(false)} />
      </div>

      <div className={`transition-all duration-300 ${collapsed ? "lg:ml-16" : "lg:ml-64"}`}>
        {/* Mobile top bar */}
        <header
          className="sticky top-0 z-20 h-14 flex items-center px-4 lg:hidden border-b border-border"
          style={{
            background: 'hsl(var(--sidebar-background) / 0.95)',
            backdropFilter: 'blur(12px)',
          }}
        >
          <button
            onClick={() => setMobileOpen(true)}
            className="w-9 h-9 rounded-xl flex items-center justify-center hover:bg-secondary transition-colors"
          >
            <Menu className="w-5 h-5 text-muted-foreground" />
          </button>
          <div className="ml-3 flex items-center gap-2">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, hsl(var(--primary)), hsl(220, 80%, 45%))',
              }}
            >
              <Shield className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-sm font-black text-foreground italic" style={{ fontFamily: "'Playfair Display', serif" }}>Rivestro</span>
          </div>
        </header>

        <main className="p-4 lg:p-6">
          <div className="page-enter">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
