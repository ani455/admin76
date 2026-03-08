import { useState } from "react";
import { Outlet } from "react-router-dom";
import AdminSidebar from "./AdminSidebar";
import { Menu } from "lucide-react";

export default function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      {mobileOpen && (
        <div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={() => setMobileOpen(false)} />
      )}

      <div className="hidden lg:block">
        <AdminSidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
      </div>
      <div className={`lg:hidden ${mobileOpen ? "block" : "hidden"}`}>
        <AdminSidebar collapsed={false} onToggle={() => setMobileOpen(false)} />
      </div>

      <div className={`transition-all duration-200 ${collapsed ? "lg:ml-16" : "lg:ml-60"}`}>
        {/* Minimal top bar - mobile only */}
        <header className="sticky top-0 z-20 h-12 bg-background border-b flex items-center px-4 lg:hidden">
          <button
            onClick={() => setMobileOpen(true)}
            className="w-8 h-8 rounded flex items-center justify-center hover:bg-muted transition-colors"
          >
            <Menu className="w-5 h-5 text-muted-foreground" />
          </button>
          <span className="ml-3 text-sm font-semibold text-foreground">ALADDINN Admin</span>
        </header>

        <main className="p-4 lg:p-5">
          <div className="page-enter">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}