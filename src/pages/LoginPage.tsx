import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Eye, EyeOff, Lock, Mail, Crown } from "lucide-react";

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
    <div className="min-h-screen relative flex items-center justify-center overflow-hidden bg-[hsl(225,25%,4%)]">
      {/* Luxury gradient layers */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,hsl(40,80%,50%,0.08),transparent_70%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_80%_80%,hsl(225,73%,57%,0.06),transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_40%_40%_at_20%_90%,hsl(40,70%,45%,0.04),transparent_50%)]" />
      </div>

      {/* Subtle gold particle dots */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-[hsl(40,80%,60%)] opacity-20 animate-pulse"
            style={{
              top: `${15 + i * 15}%`,
              left: `${10 + i * 14}%`,
              animationDelay: `${i * 0.7}s`,
              animationDuration: `${3 + i * 0.5}s`,
            }}
          />
        ))}
      </div>

      {/* Noise texture overlay */}
      <div className="absolute inset-0 opacity-[0.015]" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
      }} />

      <div className="relative z-10 w-full max-w-[400px] px-5">
        {/* Logo & brand */}
        <div className="text-center mb-12">
          <div className="relative inline-flex">
            {/* Gold glow behind icon */}
            <div className="absolute inset-0 bg-[hsl(40,80%,50%,0.15)] rounded-[20px] blur-2xl scale-[2]" />
            <div className="relative w-[68px] h-[68px] rounded-[18px] bg-gradient-to-br from-[hsl(40,75%,55%)] via-[hsl(38,80%,48%)] to-[hsl(35,85%,38%)] flex items-center justify-center shadow-[0_8px_40px_hsl(40,80%,45%,0.25),inset_0_1px_0_hsl(40,80%,70%,0.3)]">
              <Crown className="w-8 h-8 text-[hsl(40,10%,10%)]" />
            </div>
          </div>
          <h1 className="text-[26px] font-extrabold text-white mt-6 tracking-[0.04em]" style={{ fontFamily: "'Inter', sans-serif" }}>
            ALADDINN
          </h1>
          <p className="text-[12px] text-[hsl(220,15%,45%)] mt-1.5 font-medium tracking-[0.15em] uppercase">
            Admin Control Panel
          </p>
        </div>

        {/* Card */}
        <div className="relative">
          {/* Card glow */}
          <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-b from-[hsl(40,60%,50%,0.12)] via-[hsl(220,30%,40%,0.06)] to-transparent" />
          <div className="absolute inset-0 rounded-2xl bg-[hsl(225,30%,8%,0.9)] backdrop-blur-xl" />
          
          <div className="relative p-8">
            {/* Decorative line */}
            <div className="flex items-center gap-3 mb-8">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[hsl(40,60%,50%,0.2)] to-transparent" />
              <span className="text-[10px] text-[hsl(40,50%,55%)] font-semibold tracking-[0.2em] uppercase">Sign In</span>
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[hsl(40,60%,50%,0.2)] to-transparent" />
            </div>

            <form onSubmit={handleLogin} className="space-y-5">
              {/* Email */}
              <div>
                <label className="block text-[11px] font-semibold text-[hsl(220,15%,50%)] mb-2.5 tracking-[0.1em] uppercase">
                  Email
                </label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[hsl(220,15%,30%)] group-focus-within:text-[hsl(40,60%,55%)] transition-colors duration-300">
                    <Mail className="w-[15px] h-[15px]" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@aladdinn.com"
                    required
                    className="w-full h-[52px] rounded-xl bg-[hsl(225,30%,6%)] border border-[hsl(220,20%,15%)] pl-11 pr-4 text-[13px] text-white placeholder:text-[hsl(220,15%,25%)] focus:outline-none focus:border-[hsl(40,60%,45%,0.4)] focus:shadow-[0_0_0_3px_hsl(40,60%,45%,0.08)] transition-all duration-300"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-[11px] font-semibold text-[hsl(220,15%,50%)] mb-2.5 tracking-[0.1em] uppercase">
                  Password
                </label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[hsl(220,15%,30%)] group-focus-within:text-[hsl(40,60%,55%)] transition-colors duration-300">
                    <Lock className="w-[15px] h-[15px]" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••"
                    required
                    className="w-full h-[52px] rounded-xl bg-[hsl(225,30%,6%)] border border-[hsl(220,20%,15%)] pl-11 pr-12 text-[13px] text-white placeholder:text-[hsl(220,15%,25%)] focus:outline-none focus:border-[hsl(40,60%,45%,0.4)] focus:shadow-[0_0_0_3px_hsl(40,60%,45%,0.08)] transition-all duration-300"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[hsl(220,15%,28%)] hover:text-[hsl(220,15%,50%)] transition-colors duration-200"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full h-[52px] mt-3 rounded-xl bg-gradient-to-r from-[hsl(40,75%,48%)] via-[hsl(38,80%,45%)] to-[hsl(35,85%,40%)] hover:from-[hsl(40,75%,53%)] hover:via-[hsl(38,80%,50%)] hover:to-[hsl(35,85%,45%)] text-[hsl(40,10%,8%)] font-bold text-[13px] tracking-[0.04em] flex items-center justify-center gap-2.5 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_4px_24px_hsl(40,80%,45%,0.2),0_1px_0_inset_hsl(40,80%,65%,0.25)] hover:shadow-[0_6px_32px_hsl(40,80%,45%,0.3)] active:scale-[0.98]"
              >
                {loading ? (
                  <div className="w-5 h-5 border-[2.5px] border-[hsl(40,10%,8%,0.2)] border-t-[hsl(40,10%,8%)] rounded-full animate-spin" />
                ) : (
                  "Access Dashboard"
                )}
              </button>
            </form>

            {/* Bottom decorative line */}
            <div className="mt-8 h-px bg-gradient-to-r from-transparent via-[hsl(220,20%,15%)] to-transparent" />
            
            {/* Security badge */}
            <div className="mt-5 flex items-center justify-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-[hsl(142,71%,45%)] shadow-[0_0_6px_hsl(142,71%,45%,0.5)] animate-pulse" />
              <span className="text-[10px] text-[hsl(220,15%,38%)] font-medium tracking-[0.08em]">
                256-bit Encrypted Connection
              </span>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <p className="text-center mt-8 text-[10px] text-[hsl(220,15%,25%)] tracking-wider">
          © 2025 ALADDINN · All rights reserved
        </p>
      </div>
    </div>
  );
}
