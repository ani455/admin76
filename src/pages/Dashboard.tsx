import {
  UserPlus,
  IndianRupee,
  ArrowDownToLine,
  Wallet,
  Users,
  Clock,
  CheckCircle,
  ArrowUpFromLine,
  AlertTriangle,
  TrendingUp,
  Trophy,
  Percent,
} from "lucide-react";
import StatCard from "@/components/StatCard";
import GameSettingsForm from "@/components/GameSettingsForm";

const stats = [
  { title: "Today User Join", value: "1,247", icon: UserPlus, color: "blue", link: "/manage/users" },
  { title: "Today's Recharge", value: "₹8,45,230", icon: IndianRupee, color: "green" },
  { title: "Today's Withdrawal", value: "₹3,21,500", icon: ArrowDownToLine, color: "orange" },
  { title: "User Balance", value: "₹52,34,120", icon: Wallet, color: "purple", link: "/manage/users" },
  { title: "Total Users", value: "98,432", icon: Users, color: "teal", link: "/manage/users" },
  { title: "Pending Recharge", value: "₹1,23,400", icon: Clock, color: "amber", link: "/finance/deposit-update" },
  { title: "Success Recharge", value: "₹45,67,800", icon: CheckCircle, color: "emerald", link: "/finance/deposit-update" },
  { title: "Total Withdrawal", value: "₹28,90,000", icon: ArrowUpFromLine, color: "cyan", link: "/finance/withdraw-sent" },
  { title: "Withdrawal Requests", value: "₹2,45,600", icon: AlertTriangle, color: "red", link: "/finance/withdraw-apply" },
  { title: "Today's Total Bet", value: "₹12,34,567", icon: TrendingUp, color: "indigo" },
  { title: "Today's Total Win", value: "₹9,87,654", icon: Trophy, color: "pink" },
  { title: "Today's Profit", value: "₹2,46,913", icon: Percent, color: "rose" },
];

export default function Dashboard() {
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div>
      <div className="mb-6 animate-fade-in">
        <h2 className="text-2xl font-extrabold text-foreground">Hi, welcome back! 👋</h2>
        <p className="text-sm text-muted-foreground mt-1">{today}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-6">
        {stats.map((stat, index) => (
          <StatCard
            key={stat.title}
            title={stat.title}
            value={stat.value}
            icon={stat.icon}
            color={stat.color}
            link={stat.link}
            delay={index * 60}
          />
        ))}
      </div>

      <GameSettingsForm />
    </div>
  );
}
