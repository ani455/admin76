import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { remoteDb } from "@/lib/remoteDb";
import { CreditCard, Search, Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

export default function BankDetailsPage() {
  const [userId, setUserId] = useState("");
  const [banks, setBanks] = useState<any[]>([]);
  const [searched, setSearched] = useState(false);

  const searchMutation = useMutation({
    mutationFn: () => remoteDb("get_user_bank_details", { userId }),
    onSuccess: (data) => {
      setBanks(data || []);
      setSearched(true);
      if (!data || data.length === 0) toast.info("No bank details found for this user");
    },
    onError: () => { setBanks([]); setSearched(true); toast.error("User not found"); },
  });

  const updateMutation = useMutation({
    mutationFn: (params: any) => remoteDb("update_bank_detail", params),
    onSuccess: () => {
      toast.success("Bank details updated!");
      searchMutation.mutate();
    },
    onError: (e: any) => toast.error("Error: " + e.message),
  });

  return (
    <div>
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'hsl(220, 90%, 56% / 0.12)', border: '1px solid hsl(220, 90%, 56% / 0.15)' }}>
          <CreditCard className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-foreground font-display">Modify Bank Details</h2>
          <p className="text-[11px] text-muted-foreground">Search and update user bank info</p>
        </div>
      </motion.div>

      <div className="flex gap-3 mb-6 max-w-md">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input type="text" placeholder="Enter User ID..." className="search-input" value={userId}
            onChange={(e) => setUserId(e.target.value)} onKeyDown={(e) => e.key === "Enter" && searchMutation.mutate()} />
        </div>
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => searchMutation.mutate()} disabled={!userId || searchMutation.isPending}
          className="btn-neon px-5 py-2.5 text-[12px] font-display disabled:opacity-50">
          {searchMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Search"}
        </motion.button>
      </div>

      {searched && banks.length === 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card-solid rounded-2xl p-8 text-center">
          <CreditCard className="w-10 h-10 mx-auto mb-3 text-muted-foreground/40" />
          <p className="text-sm text-muted-foreground font-medium">No bank details found for this user</p>
        </motion.div>
      )}

      {banks.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          {banks.map((bank: any, idx: number) => (
            <div key={bank.id} className="glass-card-solid rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-foreground font-display">Bank #{idx + 1}</h3>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${bank.status === 1 || bank.status === 'active' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                  {bank.status === 1 || bank.status === 'active' ? 'Active' : bank.status === 0 || bank.status === 'off' ? 'Inactive' : bank.status || 'N/A'}
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-[10px] font-bold text-muted-foreground mb-2 uppercase tracking-[0.1em] font-display">Account Holder Name</label>
                  <input type="text" defaultValue={bank.name} className="search-input !pl-4" id={`name-${bank.id}`} />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-muted-foreground mb-2 uppercase tracking-[0.1em] font-display">Bank Name</label>
                  <input type="text" defaultValue={bank.bank_name} className="search-input !pl-4" id={`bankname-${bank.id}`} />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-muted-foreground mb-2 uppercase tracking-[0.1em] font-display">Account Number</label>
                  <input type="text" defaultValue={bank.account} className="search-input !pl-4" id={`account-${bank.id}`} />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-muted-foreground mb-2 uppercase tracking-[0.1em] font-display">IFSC Code</label>
                  <input type="text" defaultValue={bank.ifsc} className="search-input !pl-4" id={`ifsc-${bank.id}`} />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-muted-foreground mb-2 uppercase tracking-[0.1em] font-display">Email</label>
                  <input type="text" value={bank.email || '—'} disabled className="search-input !pl-4 opacity-50" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-muted-foreground mb-2 uppercase tracking-[0.1em] font-display">Mobile</label>
                  <input type="text" value={bank.mobile || '—'} disabled className="search-input !pl-4 opacity-50" />
                </div>
              </div>
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                onClick={() => {
                  const name = (document.getElementById(`name-${bank.id}`) as HTMLInputElement).value;
                  const account = (document.getElementById(`account-${bank.id}`) as HTMLInputElement).value;
                  const ifsc = (document.getElementById(`ifsc-${bank.id}`) as HTMLInputElement).value;
                  const bankName = (document.getElementById(`bankname-${bank.id}`) as HTMLInputElement).value;
                  updateMutation.mutate({ bankId: bank.id, name, account, ifsc, bankName });
                }}
                disabled={updateMutation.isPending}
                className="btn-neon inline-flex items-center gap-2 px-4 py-2 text-[11px] font-display disabled:opacity-50">
                <Save className="w-3.5 h-3.5" /> Update
              </motion.button>
            </div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
