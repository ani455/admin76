import { useLocation } from "react-router-dom";
import { Construction } from "lucide-react";

const pageTitles: Record<string, string> = {
  "/finance/usdt-rate": "USDT Rate",
  "/finance/withdraw-sent": "Withdraw Sent",
  "/finance/withdraw-reject": "Withdraw Rejected",
  "/support/deposit": "Deposit Problem",
  "/support/withdrawal": "Withdrawal Problem",
  "/support/ifsc": "IFSC Modification",
  "/support/bank": "Bank Modification",
  "/support/game": "Game Problem",
  "/extra/upline-chain": "Upline Chain",
  "/extra/subordinate-data": "Subordinate Data",
  "/extra/balance-deduction": "Balance Deduction",
  "/extra/users-activity": "Users Activity",
  "/manage/bonus": "Bonus Manage",
  "/manage/users-deposit": "User Manage",
  "/manage/illegal-bet": "Illegal Bet Manager",
  "/manage/bank-details": "Modify Bank Details",
  "/manage/admin-password": "Admin Password",
  "/manage/check-ip": "Check Same IP",
  "/manage/ban-users": "Ban Users",
  "/manage/users-query": "Users Query",
  "/manage/gift-code": "Gift Code",
  "/manage/demo-user": "Demo User",
  "/manage/agent-user": "Agent User",
};

export default function PlaceholderPage() {
  const location = useLocation();
  const title = pageTitles[location.pathname] || "Page";

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] animate-fade-in">
      <div className="w-20 h-20 rounded-2xl flex items-center justify-center mb-6" style={{ background: "hsl(var(--stat-amber) / 0.1)" }}>
        <Construction className="w-10 h-10" style={{ color: "hsl(var(--stat-amber))" }} />
      </div>
      <h2 className="text-2xl font-extrabold text-foreground mb-2">{title}</h2>
      <p className="text-muted-foreground text-center max-w-md">
        This module is ready for backend integration. Connect your database to see live data here.
      </p>
    </div>
  );
}
