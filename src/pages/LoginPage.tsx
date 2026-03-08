import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Eye, EyeOff, Lock, Mail, Gamepad2 } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) toast.error("Login failed: " + error.message);
    setLoading(false);
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center overflow-hidden">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[hsl(222,47%,8%)] via-[hsl(225,50%,12%)] to-[hsl(230,45%,6%)]" />
      
      {/* Floating orbs */}
      <div className="absolute top-1/4 -left-20 w-72 h-72 bg-primary/8 rounded-full blur-[100px] animate-pulse" />
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-primary/5 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: "1s" }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/3 rounded-full blur-[150px]" />
      
      {/* Grid pattern overlay */}
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: "linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)",
        backgroundSize: "60px 60px"
      }} />

      <div className="relative z-10 w-full max-w-[420px] px-5">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="relative inline-flex">
            <div className="absolute inset-0 bg-primary/20 rounded-2xl blur-xl scale-150" />
            <div className="relative w-[72px] h-[72px] rounded-2xl bg-gradient-to-br from-primary to-[hsl(225,73%,45%)] flex items-center justify-center shadow-[0_8px_32px_hsl(225,73%,57%,0.3)]">
              <Gamepad2 className="w-9 h-9 text-primary-foreground" />
            </div>
          </div>
          <h1 className="text-[28px] font-extrabold text-white mt-5 tracking-tight">
            ALADDINN
          </h1>
          <p className="text-[13px] text-[hsl(215,20%,55%)] mt-1 font-medium">
            Admin Control Panel
          </p>
        </div>

        {/* Card */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/10 to-transparent rounded-2xl blur-xl opacity-50" />
          <div className="relative bg-[hsl(222,47%,11%)]/80 backdrop-blur-2xl rounded-2xl border border-[hsl(217,33%,20%)] p-7 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.5)]">
            
            <h2 className="text-[15px] font-semibold text-white mb-1">Welcome back</h2>
            <p className="text-[12px] text-[hsl(215,20%,50%)] mb-6">Enter your credentials to continue</p>

            <form onSubmit={handleLogin} className="space-y-4">
              {/* Email */}
              <div>
                <label className="block text-[11px] font-semibold text-[hsl(215,20%,55%)] mb-2 uppercase tracking-[0.08em]">
                  Email Address
                </label>
                <div className="relative group">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[hsl(215,20%,40%)] group-focus-within:text-primary transition-colors">
                    <Mail className="w-[16px] h-[16px]" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@aladdinn.com"
                    required
                    className="w-full h-12 rounded-xl bg-[hsl(222,47%,8%)]/60 border border-[hsl(217,33%,18%)] pl-10 pr-4 text-[13px] text-white placeholder:text-[hsl(215,20%,30%)] focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/60 transition-all duration-200"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-[11px] font-semibold text-[hsl(215,20%,55%)] mb-2 uppercase tracking-[0.08em]">
                  Password
                </label>
                <div className="relative group">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[hsl(215,20%,40%)] group-focus-within:text-primary transition-colors">
                    <Lock className="w-[16px] h-[16px]" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••"
                    required
                    className="w-full h-12 rounded-xl bg-[hsl(222,47%,8%)]/60 border border-[hsl(217,33%,18%)] pl-10 pr-11 text-[13px] text-white placeholder:text-[hsl(215,20%,30%)] focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/60 transition-all duration-200"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[hsl(215,20%,35%)] hover:text-[hsl(215,20%,60%)] transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full h-12 mt-2 rounded-xl bg-gradient-to-r from-primary to-[hsl(225,73%,50%)] hover:from-[hsl(225,73%,62%)] hover:to-[hsl(225,73%,55%)] text-primary-foreground font-bold text-[13px] flex items-center justify-center gap-2.5 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_4px_20px_hsl(225,73%,57%,0.3)] hover:shadow-[0_6px_30px_hsl(225,73%,57%,0.45)] active:scale-[0.98]"
              >
                {loading ? (
                  <div className="w-5 h-5 border-[2.5px] border-white/20 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    Sign In to Dashboard
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[hsl(217,33%,15%)]/50 border border-[hsl(217,33%,18%)]">
            <div className="w-1.5 h-1.5 rounded-full bg-[hsl(142,71%,45%)] animate-pulse" />
            <span className="text-[11px] text-[hsl(215,20%,50%)] font-medium">Secure Admin Access</span>
          </div>
        </div>
      </div>
    </div>
  );
}
