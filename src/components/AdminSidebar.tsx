import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Gamepad2,
  Dice3,
  Dice5,
  Wallet,
  HeadphonesIcon,
  Settings2,
  Users,
  ChevronDown,
  ChevronLeft,
  LogOut,
  Gift,
  UserCheck,
  UserX,
  Shield,
  CreditCard,
  Building2,
  HelpCircle,
  ArrowDownUp,
  ArrowUpDown,
  Ban,
  KeyRound,
  Wifi,
  MessageSquare,
  DollarSign,
  UserPlus,
  Bot,
  Link2,
  FileText,
  MinusCircle,
  ScrollText,
} from "lucide-react";

interface MenuItem {
  title: string;
  path: string;
  icon: React.ElementType;
}

interface MenuGroup {
  title: string;
  icon: React.ElementType;
  items: MenuItem[];
}

const menuGroups: MenuGroup[] = [
  {
    title: "WinGo Manager",
    icon: Gamepad2,
    items: [
      { title: "WinGo 30 Sec", path: "/wingo/30sec", icon: Gamepad2 },
      { title: "WinGo 1 Min", path: "/wingo/1min", icon: Gamepad2 },
      { title: "WinGo 3 Min", path: "/wingo/3min", icon: Gamepad2 },
      { title: "WinGo 5 Min", path: "/wingo/5min", icon: Gamepad2 },
    ],
  },
  {
    title: "K3 Manager",
    icon: Dice3,
    items: [
      { title: "K3 1 Min", path: "/k3/1min", icon: Dice3 },
      { title: "K3 3 Min", path: "/k3/3min", icon: Dice3 },
      { title: "K3 5 Min", path: "/k3/5min", icon: Dice3 },
      { title: "K3 10 Min", path: "/k3/10min", icon: Dice3 },
    ],
  },
  {
    title: "5D Manager",
    icon: Dice5,
    items: [
      { title: "5D 1 Min", path: "/5d/1min", icon: Dice5 },
      { title: "5D 3 Min", path: "/5d/3min", icon: Dice5 },
      { title: "5D 5 Min", path: "/5d/5min", icon: Dice5 },
      { title: "5D 10 Min", path: "/5d/10min", icon: Dice5 },
    ],
  },
  {
    title: "Finance",
    icon: Wallet,
    items: [
      { title: "USDT Rate", path: "/finance/usdt-rate", icon: DollarSign },
      { title: "Deposit Update", path: "/finance/deposit-update", icon: ArrowDownUp },
      { title: "Withdraw Apply", path: "/finance/withdraw-apply", icon: ArrowUpDown },
      { title: "Withdraw Sent", path: "/finance/withdraw-sent", icon: UserCheck },
      { title: "Withdraw Reject", path: "/finance/withdraw-reject", icon: UserX },
    ],
  },
  {
    title: "Support",
    icon: HeadphonesIcon,
    items: [
      { title: "Deposit Problem", path: "/support/deposit", icon: HelpCircle },
      { title: "Withdrawal Problem", path: "/support/withdrawal", icon: HelpCircle },
      { title: "IFSC Modification", path: "/support/ifsc", icon: Building2 },
      { title: "Bank Modification", path: "/support/bank", icon: CreditCard },
      { title: "Game Problem", path: "/support/game", icon: HelpCircle },
    ],
  },
  {
    title: "Extra Settings",
    icon: Settings2,
    items: [
      { title: "Upline Chain", path: "/extra/upline-chain", icon: Link2 },
      { title: "Subordinate Data", path: "/extra/subordinate-data", icon: FileText },
      { title: "Balance Deduction", path: "/extra/balance-deduction", icon: MinusCircle },
      { title: "Users Activity", path: "/extra/users-activity", icon: ScrollText },
    ],
  },
  {
    title: "Manage Game",
    icon: Users,
    items: [
      { title: "Bonus Manage", path: "/manage/bonus", icon: Gift },
      { title: "User Manage", path: "/manage/users-deposit", icon: UserPlus },
      { title: "Illegal Bet", path: "/manage/illegal-bet", icon: Ban },
      { title: "Bank Details", path: "/manage/bank-details", icon: CreditCard },
      { title: "Admin Password", path: "/manage/admin-password", icon: KeyRound },
      { title: "Check Same IP", path: "/manage/check-ip", icon: Wifi },
      { title: "Ban Users", path: "/manage/ban-users", icon: Shield },
      { title: "Users Query", path: "/manage/users-query", icon: MessageSquare },
      { title: "Users", path: "/manage/users", icon: Users },
      { title: "Gift Code", path: "/manage/gift-code", icon: Gift },
      { title: "Demo User", path: "/manage/demo-user", icon: Bot },
      { title: "Agent User", path: "/manage/agent-user", icon: UserCheck },
    ],
  },
];

interface AdminSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export default function AdminSidebar({ collapsed, onToggle }: AdminSidebarProps) {
  const location = useLocation();
  const [openGroups, setOpenGroups] = useState<string[]>(() => {
    const active = menuGroups.find((g) =>
      g.items.some((i) => location.pathname.startsWith(i.path))
    );
    return active ? [active.title] : [];
  });

  const toggleGroup = (title: string) => {
    setOpenGroups((prev) =>
      prev.includes(title) ? prev.filter((t) => t !== title) : [...prev, title]
    );
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <aside
      className={`fixed left-0 top-0 h-screen z-40 flex flex-col transition-all duration-300 ease-in-out ${
        collapsed ? "w-[68px]" : "w-[260px]"
      }`}
      style={{ background: "hsl(var(--sidebar-bg))" }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between h-16 px-4 border-b"
        style={{
          background: "hsl(var(--sidebar-header))",
          borderColor: "hsl(var(--sidebar-border))",
        }}
      >
        {!collapsed && (
          <div className="flex items-center gap-3 animate-fade-in-left">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, hsl(var(--stat-blue)), hsl(var(--stat-purple)))" }}>
              <Gamepad2 className="w-5 h-5" style={{ color: "hsl(var(--sidebar-active-fg))" }} />
            </div>
            <div>
              <h1 className="text-sm font-bold tracking-wide" style={{ color: "hsl(var(--sidebar-active-fg))" }}>
                ALADDINN GAME
              </h1>
              <p className="text-[10px] font-medium tracking-widest uppercase" style={{ color: "hsl(var(--sidebar-fg))" }}>
                Admin Panel
              </p>
            </div>
          </div>
        )}
        <button
          onClick={onToggle}
          className="w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 hover:scale-105"
          style={{ background: "hsl(var(--sidebar-hover))", color: "hsl(var(--sidebar-fg))" }}
        >
          <ChevronLeft
            className={`w-4 h-4 transition-transform duration-300 ${collapsed ? "rotate-180" : ""}`}
          />
        </button>
      </div>

      {/* Profile */}
      {!collapsed && (
        <div className="px-4 py-4 border-b animate-fade-in" style={{ borderColor: "hsl(var(--sidebar-border))" }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br flex items-center justify-center text-sm font-bold"
              style={{ background: "linear-gradient(135deg, hsl(var(--stat-blue)), hsl(var(--stat-teal)))", color: "white" }}>
              GA
            </div>
            <div>
              <p className="text-sm font-semibold" style={{ color: "hsl(var(--sidebar-active-fg))" }}>Game Admin</p>
              <p className="text-xs" style={{ color: "hsl(var(--sidebar-fg))" }}>Super Admin</p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-3 px-2">
        {/* Dashboard */}
        <Link
          to="/"
          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg mb-1 transition-all duration-200 group ${
            isActive("/")
              ? "shadow-lg"
              : ""
          }`}
          style={{
            background: isActive("/") ? "hsl(var(--sidebar-active))" : "transparent",
            color: isActive("/") ? "hsl(var(--sidebar-active-fg))" : "hsl(var(--sidebar-fg))",
          }}
          onMouseEnter={(e) => {
            if (!isActive("/")) e.currentTarget.style.background = "hsl(var(--sidebar-hover))";
          }}
          onMouseLeave={(e) => {
            if (!isActive("/")) e.currentTarget.style.background = "transparent";
          }}
        >
          <LayoutDashboard className="w-5 h-5 flex-shrink-0" />
          {!collapsed && <span className="text-sm font-medium">Dashboard</span>}
        </Link>

        {/* Menu Groups */}
        {menuGroups.map((group) => {
          const isOpen = openGroups.includes(group.title);
          const hasActive = group.items.some((i) => isActive(i.path));

          return (
            <div key={group.title} className="mb-0.5">
              <button
                onClick={() => !collapsed && toggleGroup(group.title)}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200"
                style={{
                  color: hasActive ? "hsl(var(--sidebar-active-fg))" : "hsl(var(--sidebar-fg))",
                  background: hasActive && !isOpen ? "hsl(var(--sidebar-hover))" : "transparent",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "hsl(var(--sidebar-hover))";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = hasActive && !isOpen ? "hsl(var(--sidebar-hover))" : "transparent";
                }}
              >
                <group.icon className="w-5 h-5 flex-shrink-0" />
                {!collapsed && (
                  <>
                    <span className="text-sm font-medium flex-1 text-left">{group.title}</span>
                    <ChevronDown
                      className={`w-4 h-4 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
                    />
                  </>
                )}
              </button>

              {/* Sub items */}
              {!collapsed && (
                <div
                  className={`overflow-hidden transition-all duration-300 ease-in-out ${
                    isOpen ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
                  }`}
                >
                  <div className="ml-4 pl-4 border-l py-1" style={{ borderColor: "hsl(var(--sidebar-border))" }}>
                    {group.items.map((item) => (
                      <Link
                        key={item.path}
                        to={item.path}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-md text-[13px] transition-all duration-200"
                        style={{
                          background: isActive(item.path) ? "hsl(var(--sidebar-active) / 0.15)" : "transparent",
                          color: isActive(item.path) ? "hsl(var(--sidebar-active))" : "hsl(var(--sidebar-fg))",
                          fontWeight: isActive(item.path) ? 600 : 400,
                        }}
                        onMouseEnter={(e) => {
                          if (!isActive(item.path)) {
                            e.currentTarget.style.background = "hsl(var(--sidebar-hover))";
                            e.currentTarget.style.color = "hsl(var(--sidebar-active-fg))";
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!isActive(item.path)) {
                            e.currentTarget.style.background = "transparent";
                            e.currentTarget.style.color = "hsl(var(--sidebar-fg))";
                          }
                        }}
                      >
                        <div
                          className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                          style={{
                            background: isActive(item.path) ? "hsl(var(--sidebar-active))" : "hsl(var(--sidebar-fg) / 0.3)",
                          }}
                        />
                        {item.title}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-3 py-3 border-t" style={{ borderColor: "hsl(var(--sidebar-border))" }}>
        <button
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200"
          style={{ color: "hsl(var(--stat-red))" }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "hsl(var(--stat-red) / 0.1)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "transparent";
          }}
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {!collapsed && <span className="text-sm font-medium">Logout</span>}
        </button>
      </div>
    </aside>
  );
}
