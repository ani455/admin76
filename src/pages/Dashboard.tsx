import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  UserPlus, IndianRupee, ArrowDownToLine, Wallet, Users,
  Clock, CheckCircle, ArrowUpFromLine, AlertTriangle,
  TrendingUp, Trophy, Percent,
} from "lucide-react";
import StatCard from "@/components/StatCard";
import GameSettingsForm from "@/components/GameSettingsForm";

export default function Dashboard() {
  const today = new Date();
  const todayStr = today.toISOString().split("T")[0];
  const todayDisplay = today.toLocaleDateString("en-US", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });

  const { data: totalUsers = 0 } = useQuery({
    queryKey: ["dashboard-total-users"],
    queryFn: async () => {
      const { count } = await supabase.from("users").select("*", { count: "exact", head: true }).eq("is_demo", false);
      return count || 0;
    },
  });

  const { data: todayUsers = 0 } = useQuery({
    queryKey: ["dashboard-today-users"],
    queryFn: async () => {
      const { count } = await supabase.from("users").select("*", { count: "exact", head: true }).eq("is_demo", false).gte("created_at", todayStr);
      return count || 0;
    },
  });

  const { data: userBalance = 0 } = useQuery({
    queryKey: ["dashboard-user-balance"],
    queryFn: async () => {
      const { data } = await supabase.from("users").select("balance").eq("is_demo", false);
      return data?.reduce((sum, u) => sum + Number(u.balance), 0) || 0;
    },
  });

  const { data: depositStats } = useQuery({
    queryKey: ["dashboard-deposits"],
    queryFn: async () => {
      const { data: todayApproved } = await supabase.from("deposits").select("amount").eq("status", "approved").gte("created_at", todayStr);
      const { data: todayWithdraw } = await supabase.from("withdrawals").select("amount").eq("status", "approved").gte("created_at", todayStr);
      const { data: pendingDep } = await supabase.from("deposits").select("amount").eq("status", "pending");
      const { data: successDep } = await supabase.from("deposits").select("amount").eq("status", "approved");
      const { data: totalWith } = await supabase.from("withdrawals").select("amount").eq("status", "approved");
      const { data: pendingWith } = await supabase.from("withdrawals").select("amount").eq("status", "pending");

      const sum = (arr: any[] | null) => arr?.reduce((s, r) => s + Number(r.amount), 0) || 0;
      return {
        todayRecharge: sum(todayApproved),
        todayWithdraw: sum(todayWithdraw),
        pendingRecharge: sum(pendingDep),
        successRecharge: sum(successDep),
        totalWithdrawal: sum(totalWith),
        withdrawalRequests: sum(pendingWith),
      };
    },
  });

  const { data: betStats } = useQuery({
    queryKey: ["dashboard-bets"],
    queryFn: async () => {
      const { data: todayBets } = await supabase.from("bets").select("amount, win_amount, result").gte("created_at", todayStr);
      const totalBet = todayBets?.reduce((s, b) => s + Number(b.amount), 0) || 0;
      const totalWin = todayBets?.filter(b => b.result === "win").reduce((s, b) => s + Number(b.win_amount || 0), 0) || 0;
      return { totalBet, totalWin, profit: totalBet - totalWin };
    },
  });

  const fmt = (n: number) => `₹${n.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;

  const stats = [
    { title: "Today User Join", value: todayUsers.toLocaleString(), icon: UserPlus, color: "blue", link: "/manage/users" },
    { title: "Today's Recharge", value: fmt(depositStats?.todayRecharge || 0), icon: IndianRupee, color: "green" },
    { title: "Today's Withdrawal", value: fmt(depositStats?.todayWithdraw || 0), icon: ArrowDownToLine, color: "orange" },
    { title: "User Balance", value: fmt(userBalance), icon: Wallet, color: "purple", link: "/manage/users" },
    { title: "Total Users", value: totalUsers.toLocaleString(), icon: Users, color: "teal", link: "/manage/users" },
    { title: "Pending Recharge", value: fmt(depositStats?.pendingRecharge || 0), icon: Clock, color: "amber", link: "/finance/deposit-update" },
    { title: "Success Recharge", value: fmt(depositStats?.successRecharge || 0), icon: CheckCircle, color: "emerald", link: "/finance/deposit-update" },
    { title: "Total Withdrawal", value: fmt(depositStats?.totalWithdrawal || 0), icon: ArrowUpFromLine, color: "cyan", link: "/finance/withdraw-sent" },
    { title: "Withdrawal Requests", value: fmt(depositStats?.withdrawalRequests || 0), icon: AlertTriangle, color: "red", link: "/finance/withdraw-apply" },
    { title: "Today's Total Bet", value: fmt(betStats?.totalBet || 0), icon: TrendingUp, color: "indigo" },
    { title: "Today's Total Win", value: fmt(betStats?.totalWin || 0), icon: Trophy, color: "pink" },
    { title: "Today's Profit", value: fmt(betStats?.profit || 0), icon: Percent, color: "rose" },
  ];

  return (
    <div>
      <div className="mb-6 animate-fade-in">
        <h2 className="text-2xl font-extrabold text-foreground">Hi, welcome back! 👋</h2>
        <p className="text-sm text-muted-foreground mt-1">{todayDisplay}</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-6">
        {stats.map((stat, index) => (
          <StatCard key={stat.title} {...stat} delay={index * 60} />
        ))}
      </div>
      <GameSettingsForm />
    </div>
  );
}
