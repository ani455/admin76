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
    <div className="flex flex-col items-center justify-center min-h-[50vh]">
      <Construction className="w-10 h-10 text-muted-foreground/40 mb-3" />
      <h2 className="text-base font-bold text-foreground mb-1">{title}</h2>
      <p className="text-xs text-muted-foreground">This module will be available soon.</p>
    </div>
  );
}