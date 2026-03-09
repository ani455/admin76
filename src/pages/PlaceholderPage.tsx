import { useLocation } from "react-router-dom";
import { Construction } from "lucide-react";
import { motion } from "framer-motion";

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
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col items-center justify-center min-h-[60vh]"
    >
      <div className="glass-card-solid rounded-3xl p-12 text-center max-w-sm">
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5"
          style={{
            background: 'hsl(38, 92%, 50% / 0.1)',
            border: '1px solid hsl(38, 92%, 50% / 0.15)',
          }}
        >
          <Construction className="w-7 h-7" style={{ color: 'hsl(38, 92%, 55%)' }} />
        </div>
        <h2 className="text-lg font-bold text-foreground mb-2 font-display">{title}</h2>
        <p className="text-sm text-muted-foreground">This module will be available soon.</p>
      </div>
    </motion.div>
  );
}
