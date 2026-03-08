import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import {
  LayoutDashboard, Gamepad2, Dice3, Dice5, Wallet,
  HeadphonesIcon, Settings2, Users, ChevronDown, ChevronLeft,
  LogOut, Gift, UserCheck, UserX, Shield, CreditCard,
  Building2, HelpCircle, ArrowDownUp, ArrowUpDown, Ban,
  KeyRound, Wifi, MessageSquare, DollarSign, UserPlus,
  Bot, Link2, FileText, MinusCircle, ScrollText,
} from "lucide-react";

interface MenuItem { title: string; path: string; icon: React.ElementType; }
interface MenuGroup { title: string; icon: React.ElementType; items: MenuItem[]; }

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
  const { signOut } = useAuth();
  const location = useLocation();
  const [openGroups, setOpenGroups] = useState<string[]>(() => {
    const active = menuGroups.find((g) =>
      g.items.some((i) => location.pathname.startsWith(i.path))
    );
    return active ? [active.title] : [];
  });

  const toggleGroup = (title: string) =>
    setOpenGroups((prev) =>
      prev.includes(title) ? prev.filter((t) => t !== title) : [...prev, title]
    );

  const isActive = (path: string) => location.pathname === path;

  return (
    <aside
      className={`fixed left-0 top-0 h-screen z-40 flex flex-col transition-all duration-300 ${
        collapsed ? "w-16" : "w-64"
      }`}
      style={{
        background: 'linear-gradient(180deg, hsl(var(--sidebar-background)) 0%, hsl(225, 20%, 10%) 100%)',
        borderRight: '1px solid hsl(var(--sidebar-border))',
      }}
    >
      {/* Sidebar glow accent */}
      <div
        className="absolute top-0 left-0 right-0 h-32 pointer-events-none opacity-20"
        style={{
          background: 'radial-gradient(ellipse at 50% -20%, hsl(var(--primary) / 0.2), transparent 70%)',
        }}
      />

      {/* Logo */}
      <div className="relative flex items-center h-16 px-3 border-b border-sidebar-border">
        {!collapsed && (
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{
                background: 'linear-gradient(135deg, hsl(var(--primary)), hsl(220, 80%, 45%))',
                boxShadow: '0 0 20px hsl(var(--primary) / 0.25)',
              }}
            >
              <Shield className="w-4.5 h-4.5 text-white" />
            </div>
            <div className="min-w-0">
              <p className="text-[14px] font-bold text-foreground truncate leading-tight font-display tracking-tight">
                ALADDINN
              </p>
              <p className="text-[10px] text-muted-foreground font-medium leading-tight font-mono">
                Admin v2.0
              </p>
            </div>
          </div>
        )}
        <button
          onClick={onToggle}
          className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-all duration-200 flex-shrink-0"
        >
          <ChevronLeft className={`w-4 h-4 transition-transform duration-300 ${collapsed ? "rotate-180" : ""}`} />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto sidebar-nav py-3 px-2.5">
        {/* Dashboard link */}
        <Link
          to="/"
          className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-200 mb-1 ${
            isActive("/")
              ? "text-primary-foreground"
              : "text-muted-foreground hover:text-foreground hover:bg-secondary"
          }`}
          style={isActive("/") ? {
            background: 'linear-gradient(135deg, hsl(var(--primary) / 0.2), hsl(var(--primary) / 0.08))',
            boxShadow: '0 0 0 1px hsl(var(--primary) / 0.25), 0 0 12px hsl(var(--primary) / 0.08)',
          } : {}}
        >
          <LayoutDashboard className="w-[18px] h-[18px] flex-shrink-0" />
          {!collapsed && <span className="font-display">{isActive("/") ? <span className="text-primary">Dashboard</span> : "Dashboard"}</span>}
          {isActive("/") && !collapsed && (
            <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary"
              style={{ boxShadow: '0 0 6px hsl(var(--primary))' }}
            />
          )}
        </Link>

        {/* Groups */}
        {menuGroups.map((group) => {
          const isOpen = openGroups.includes(group.title);
          const hasActive = group.items.some((i) => isActive(i.path));

          return (
            <div key={group.title} className="mt-0.5">
              <button
                onClick={() => !collapsed && toggleGroup(group.title)}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-200 ${
                  hasActive
                    ? "text-foreground bg-secondary"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                }`}
              >
                <group.icon className="w-[18px] h-[18px] flex-shrink-0" />
                {!collapsed && (
                  <>
                    <span className="flex-1 text-left truncate font-display">{group.title}</span>
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} />
                  </>
                )}
              </button>

              {!collapsed && isOpen && (
                <div className="ml-[22px] pl-3 border-l border-border mt-1 mb-1.5 space-y-0.5">
                  {group.items.map((item) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`flex items-center gap-2.5 px-3 py-[7px] rounded-lg text-[12px] transition-all duration-200 ${
                        isActive(item.path)
                          ? "text-primary font-semibold bg-primary/10"
                          : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 transition-all duration-200 ${
                        isActive(item.path)
                          ? "bg-primary"
                          : "bg-muted-foreground/30"
                      }`}
                        style={isActive(item.path) ? { boxShadow: '0 0 6px hsl(var(--primary))' } : {}}
                      />
                      <span className="truncate">{item.title}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="px-2.5 py-3 border-t border-sidebar-border">
        <button
          onClick={() => signOut()}
          className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-[13px] font-medium text-destructive hover:bg-destructive/10 transition-all duration-200"
        >
          <LogOut className="w-[18px] h-[18px] flex-shrink-0" />
          {!collapsed && <span className="font-display">Logout</span>}
        </button>
      </div>
    </aside>
  );
}
