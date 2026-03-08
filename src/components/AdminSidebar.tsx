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
      className={`fixed left-0 top-0 h-screen z-40 flex flex-col bg-sidebar transition-all duration-200 ${
        collapsed ? "w-16" : "w-60"
      }`}
    >
      {/* Logo */}
      <div className="flex items-center h-14 px-3 border-b border-sidebar-border">
        {!collapsed && (
          <div className="flex items-center gap-2.5 flex-1 min-w-0">
            <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center flex-shrink-0">
              <Gamepad2 className="w-4 h-4 text-primary-foreground" />
            </div>
            <div className="min-w-0">
              <p className="text-[13px] font-bold text-white truncate leading-tight">ALADDINN</p>
              <p className="text-[10px] text-sidebar-foreground/60 font-medium leading-tight">Admin Panel</p>
            </div>
          </div>
        )}
        <button
          onClick={onToggle}
          className="w-7 h-7 rounded flex items-center justify-center text-sidebar-foreground/60 hover:text-white hover:bg-sidebar-accent transition-colors flex-shrink-0"
        >
          <ChevronLeft className={`w-4 h-4 transition-transform ${collapsed ? "rotate-180" : ""}`} />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto sidebar-nav py-2 px-2">
        {/* Dashboard link */}
        <Link
          to="/"
          className={`flex items-center gap-2.5 px-2.5 py-2 rounded text-[13px] font-medium transition-colors mb-0.5 ${
            isActive("/")
              ? "bg-primary text-white"
              : "text-sidebar-foreground/70 hover:text-white hover:bg-sidebar-accent"
          }`}
        >
          <LayoutDashboard className="w-[18px] h-[18px] flex-shrink-0" />
          {!collapsed && <span>Dashboard</span>}
        </Link>

        {/* Groups */}
        {menuGroups.map((group) => {
          const isOpen = openGroups.includes(group.title);
          const hasActive = group.items.some((i) => isActive(i.path));

          return (
            <div key={group.title} className="mt-0.5">
              <button
                onClick={() => !collapsed && toggleGroup(group.title)}
                className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded text-[13px] font-medium transition-colors ${
                  hasActive
                    ? "text-white bg-sidebar-accent"
                    : "text-sidebar-foreground/70 hover:text-white hover:bg-sidebar-accent"
                }`}
              >
                <group.icon className="w-[18px] h-[18px] flex-shrink-0" />
                {!collapsed && (
                  <>
                    <span className="flex-1 text-left truncate">{group.title}</span>
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isOpen ? "rotate-180" : ""}`} />
                  </>
                )}
              </button>

              {!collapsed && isOpen && (
                <div className="ml-[18px] pl-3 border-l border-sidebar-border/50 mt-0.5 mb-1">
                  {group.items.map((item) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`flex items-center gap-2 px-2.5 py-1.5 rounded text-[12px] transition-colors ${
                        isActive(item.path)
                          ? "text-primary font-semibold bg-primary/10"
                          : "text-sidebar-foreground/50 hover:text-sidebar-foreground/90 hover:bg-sidebar-accent/50"
                      }`}
                    >
                      <span className={`w-1 h-1 rounded-full flex-shrink-0 ${
                        isActive(item.path) ? "bg-primary" : "bg-sidebar-foreground/20"
                      }`} />
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
      <div className="px-2 py-2 border-t border-sidebar-border">
        <button className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded text-[13px] font-medium text-red-400 hover:bg-red-500/10 transition-colors">
          <LogOut className="w-[18px] h-[18px] flex-shrink-0" />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
}