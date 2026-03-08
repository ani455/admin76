import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Eye, EyeOff, Lock, Mail, ArrowRight, Shield } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [focused, setFocused] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) toast.error("Login failed: " + error.message);
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex bg-[hsl(var(--login-bg))]">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-[55%] relative overflow-hidden items-center justify-center">
        {/* Animated mesh gradient */}
        <div className="absolute inset-0">
          <div 
            className="absolute w-[800px] h-[800px] rounded-full blur-[120px] opacity-30"
            style={{ 
              background: 'hsl(var(--login-accent))',
              top: '-20%', left: '-10%',
              animation: 'loginGlow 8s ease-in-out infinite'
            }} 
          />
          <div 
            className="absolute w-[600px] h-[600px] rounded-full blur-[100px] opacity-20"
            style={{ 
              background: 'hsl(160, 70%, 50%)',
              bottom: '-15%', right: '-5%',
              animation: 'loginGlow 10s ease-in-out infinite',
              animationDelay: '2s'
            }} 
          />
          <div 
            className="absolute w-[400px] h-[400px] rounded-full blur-[80px] opacity-15"
            style={{ 
              background: 'hsl(200, 80%, 50%)',
              top: '40%', left: '50%',
              animation: 'loginGlow 6s ease-in-out infinite',
              animationDelay: '4s'
            }} 
          />
        </div>

        {/* Grid dots */}
        <div className="absolute inset-0 opacity-[0.04]" style={{
          backgroundImage: 'radial-gradient(circle, hsl(0 0% 100%) 1px, transparent 1px)',
          backgroundSize: '32px 32px'
        }} />

        {/* Content */}
        <div className="relative z-10 max-w-md px-12 login-float-in" style={{ animationDelay: '0.2s' }}>
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-2xl bg-[hsl(var(--login-accent))] flex items-center justify-center shadow-[0_0_40px_hsl(var(--login-accent-glow)/0.3)]">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                ALADDINN
              </h2>
              <p className="text-[11px] text-[hsl(var(--login-muted))] font-medium">
                Control Panel v2.0
              </p>
            </div>
          </div>

          <h1 className="text-[42px] font-extrabold text-white leading-[1.1] tracking-tight mb-5" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            Manage.<br />
            <span className="text-[hsl(var(--login-accent))]">Monitor.</span><br />
            Control.
          </h1>
          <p className="text-[15px] text-[hsl(220,12%,55%)] leading-relaxed max-w-sm">
            Real-time analytics, user management, and complete platform control from one secure dashboard.
          </p>

          {/* Stats preview */}
          <div className="mt-10 grid grid-cols-3 gap-4">
            {[
              { label: 'Active Users', value: '12.4K' },
              { label: 'Revenue', value: '₹8.2L' },
              { label: 'Uptime', value: '99.9%' },
            ].map((stat, i) => (
              <div 
                key={stat.label}
                className="bg-[hsl(220,20%,10%,0.5)] backdrop-blur-sm border border-[hsl(var(--login-border),0.5)] rounded-xl p-3.5 login-float-in"
                style={{ animationDelay: `${0.5 + i * 0.1}s` }}
              >
                <p className="text-[18px] font-bold text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  {stat.value}
                </p>
                <p className="text-[10px] text-[hsl(var(--login-muted))] mt-0.5 font-medium uppercase tracking-wider">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="w-full lg:w-[45%] flex items-center justify-center px-6 relative">
        {/* Subtle border on left */}
        <div className="hidden lg:block absolute left-0 top-[10%] bottom-[10%] w-px bg-gradient-to-b from-transparent via-[hsl(var(--login-border))] to-transparent" />

        <div className="w-full max-w-[380px] login-float-in" style={{ animationDelay: '0.3s' }}>
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-10">
            <div className="inline-flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-[hsl(var(--login-accent))] flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-bold text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                ALADDINN
              </span>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-[28px] font-bold text-white tracking-tight" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              Welcome back
            </h2>
            <p className="text-[14px] text-[hsl(var(--login-muted))] mt-1.5">
              Sign in to your admin account to continue
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-[12px] font-semibold text-[hsl(220,12%,55%)] mb-2" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                Email Address
              </label>
              <div className={`relative rounded-xl transition-all duration-300 ${
                focused === 'email' 
                  ? 'shadow-[0_0_0_2px_hsl(var(--login-accent)/0.3),0_0_20px_hsl(var(--login-accent)/0.08)]' 
                  : ''
              }`}>
                <div className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-300 ${
                  focused === 'email' ? 'text-[hsl(var(--login-accent))]' : 'text-[hsl(220,12%,28%)]'
                }`}>
                  <Mail className="w-[16px] h-[16px]" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setFocused('email')}
                  onBlur={() => setFocused(null)}
                  placeholder="you@company.com"
                  required
                  className="w-full h-[50px] rounded-xl bg-[hsl(var(--login-input-bg))] border border-[hsl(var(--login-border))] pl-11 pr-4 text-[13px] text-white placeholder:text-[hsl(220,12%,25%)] focus:outline-none transition-colors duration-300 focus:border-[hsl(var(--login-accent)/0.4)]"
                  style={{ fontFamily: "'Outfit', sans-serif" }}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-[12px] font-semibold text-[hsl(220,12%,55%)] mb-2" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                Password
              </label>
              <div className={`relative rounded-xl transition-all duration-300 ${
                focused === 'password' 
                  ? 'shadow-[0_0_0_2px_hsl(var(--login-accent)/0.3),0_0_20px_hsl(var(--login-accent)/0.08)]' 
                  : ''
              }`}>
                <div className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-300 ${
                  focused === 'password' ? 'text-[hsl(var(--login-accent))]' : 'text-[hsl(220,12%,28%)]'
                }`}>
                  <Lock className="w-[16px] h-[16px]" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setFocused('password')}
                  onBlur={() => setFocused(null)}
                  placeholder="Enter your password"
                  required
                  className="w-full h-[50px] rounded-xl bg-[hsl(var(--login-input-bg))] border border-[hsl(var(--login-border))] pl-11 pr-12 text-[13px] text-white placeholder:text-[hsl(220,12%,25%)] focus:outline-none transition-colors duration-300 focus:border-[hsl(var(--login-accent)/0.4)]"
                  style={{ fontFamily: "'Outfit', sans-serif" }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[hsl(220,12%,28%)] hover:text-[hsl(220,12%,55%)] transition-colors duration-200"
                >
                  {showPassword ? <EyeOff className="w-[15px] h-[15px]" /> : <Eye className="w-[15px] h-[15px]" />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-[50px] mt-2 rounded-xl font-semibold text-[14px] text-white flex items-center justify-center gap-2.5 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] group login-shimmer-btn"
              style={{ 
                background: 'linear-gradient(135deg, hsl(var(--login-accent)), hsl(160,70%,35%), hsl(var(--login-accent)))',
                boxShadow: '0 4px 24px hsl(var(--login-accent-glow)/0.25), 0 0 0 1px hsl(var(--login-accent)/0.2)',
                fontFamily: "'Space Grotesk', sans-serif",
              }}
            >
              {loading ? (
                <div className="w-5 h-5 border-[2.5px] border-white/20 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Sign In
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform duration-200" />
                </>
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-[hsl(var(--login-border),0.5)]">
            <div className="flex items-center justify-center gap-2">
              <div className="relative">
                <div className="w-2 h-2 rounded-full bg-[hsl(var(--success))]" />
                <div className="absolute inset-0 w-2 h-2 rounded-full bg-[hsl(var(--success))] animate-ping opacity-50" />
              </div>
              <span className="text-[11px] text-[hsl(var(--login-muted))] font-medium">
                System Operational · All Services Running
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
