import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Eye, EyeOff, Lock, Mail, ArrowRight, Shield, Zap, Users, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";

function Particles() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {Array.from({ length: 20 }).map((_, i) => (
        <div
          key={i}
          className="particle"
          style={{
            left: `${Math.random() * 100}%`,
            bottom: `-${Math.random() * 20}px`,
            width: `${2 + Math.random() * 3}px`,
            height: `${2 + Math.random() * 3}px`,
            animationDuration: `${8 + Math.random() * 15}s`,
            animationDelay: `${Math.random() * 10}s`,
            opacity: 0.15 + Math.random() * 0.3,
          }}
        />
      ))}
    </div>
  );
}

export default function LoginPage() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [focused, setFocused] = useState<string | null>(null);

  useEffect(() => {
    if (user && !authLoading) {
      navigate("/", { replace: true });
    }
  }, [user, authLoading, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      toast.error("Login failed: " + error.message);
    } else {
      navigate("/", { replace: true });
    }
    setLoading(false);
  };

  if (user && !authLoading) return null;

  const stats = [
    { icon: Users, label: "Active Users", value: "12.4K" },
    { icon: TrendingUp, label: "Revenue", value: "₹8.2L" },
    { icon: Zap, label: "Uptime", value: "99.9%" },
  ];

  return (
    <div className="min-h-screen flex bg-background">
      {/* Animated Orbs Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute w-[700px] h-[700px] rounded-full blur-[150px] morph-blob"
          style={{
            background: 'hsl(220, 90%, 56% / 0.06)',
            top: '-15%', left: '-10%',
            animation: 'loginGlow 12s ease-in-out infinite, morphBlob 20s ease-in-out infinite',
          }}
        />
        <div
          className="absolute w-[500px] h-[500px] rounded-full blur-[120px] morph-blob"
          style={{
            background: 'hsl(270, 80%, 55% / 0.05)',
            bottom: '-10%', right: '-5%',
            animation: 'loginGlow 15s ease-in-out infinite, morphBlob 25s ease-in-out infinite',
            animationDelay: '3s',
          }}
        />
      </div>

      <Particles />

      {/* Grid dots */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03]" style={{
        backgroundImage: 'radial-gradient(circle, hsl(0 0% 100%) 1px, transparent 1px)',
        backgroundSize: '40px 40px',
      }} />

      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-[55%] relative overflow-hidden items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="relative z-10 max-w-lg px-16"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="flex items-center gap-4 mb-10"
          >
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center pulse-glow"
              style={{
                background: 'linear-gradient(135deg, hsl(220, 90%, 56%), hsl(220, 80%, 45%))',
              }}
            >
              <Shield className="w-7 h-7 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white tracking-tight font-display">
                ALADDINN
              </h2>
              <p className="text-xs text-muted-foreground font-medium font-mono">
                Control Panel v2.0
              </p>
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-[52px] font-extrabold text-white leading-[1.05] tracking-[-0.03em] mb-6 font-display"
          >
            Manage.<br />
            <span className="text-primary">Monitor.</span><br />
            Control.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-[15px] text-muted-foreground leading-relaxed max-w-sm"
          >
            Real-time analytics, user management, and complete platform control from one secure dashboard.
          </motion.p>

          {/* Stats */}
          <div className="mt-12 grid grid-cols-3 gap-4">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 + i * 0.1 }}
                className="glass-card rounded-2xl p-4 border-glow"
              >
                <stat.icon className="w-4 h-4 mb-2 text-primary" />
                <p className="text-xl font-bold text-white font-display">{stat.value}</p>
                <p className="text-[10px] text-muted-foreground mt-1 font-semibold uppercase tracking-wider">
                  {stat.label}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="w-full lg:w-[45%] flex items-center justify-center px-6 relative z-10">
        <div className="hidden lg:block absolute left-0 top-[10%] bottom-[10%] w-px" style={{
          background: 'linear-gradient(to bottom, transparent, hsl(var(--border)), transparent)',
        }} />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-[400px]"
        >
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-10">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-3"
            >
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center pulse-glow"
                style={{
                  background: 'linear-gradient(135deg, hsl(220, 90%, 56%), hsl(220, 80%, 45%))',
                }}
              >
                <Shield className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white font-display">ALADDINN</span>
            </motion.div>
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-bold text-white tracking-tight font-display">
              Welcome back
            </h2>
            <p className="text-sm text-muted-foreground mt-2">
              Sign in to access your admin dashboard
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            {/* Email Field */}
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <label className="block text-[11px] font-bold text-muted-foreground mb-2.5 uppercase tracking-wider font-display">
                Email Address
              </label>
              <div className={`relative rounded-xl transition-all duration-300 ${
                focused === 'email'
                  ? 'shadow-[0_0_0_2px_hsl(220,90%,56%/0.25),0_0_25px_hsl(220,90%,56%/0.08)]'
                  : ''
              }`}>
                <div className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-300 ${
                  focused === 'email' ? 'text-primary' : 'text-muted-foreground/50'
                }`}>
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setFocused('email')}
                  onBlur={() => setFocused(null)}
                  placeholder="admin@aladdinn.com"
                  required
                  className="w-full h-[52px] rounded-xl bg-secondary border border-border pl-12 pr-4 text-[13px] text-foreground placeholder:text-muted-foreground/40 focus:outline-none transition-all duration-300 focus:border-primary/40"
                />
              </div>
            </motion.div>

            {/* Password Field */}
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
            >
              <label className="block text-[11px] font-bold text-muted-foreground mb-2.5 uppercase tracking-wider font-display">
                Password
              </label>
              <div className={`relative rounded-xl transition-all duration-300 ${
                focused === 'password'
                  ? 'shadow-[0_0_0_2px_hsl(220,90%,56%/0.25),0_0_25px_hsl(220,90%,56%/0.08)]'
                  : ''
              }`}>
                <div className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-300 ${
                  focused === 'password' ? 'text-primary' : 'text-muted-foreground/50'
                }`}>
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setFocused('password')}
                  onBlur={() => setFocused(null)}
                  placeholder="Enter your password"
                  required
                  className="w-full h-[52px] rounded-xl bg-secondary border border-border pl-12 pr-12 text-[13px] text-foreground placeholder:text-muted-foreground/40 focus:outline-none transition-all duration-300 focus:border-primary/40"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground/50 hover:text-muted-foreground transition-colors duration-200"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </motion.div>

            {/* Submit Button */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <button
                type="submit"
                disabled={loading}
                className="w-full h-[52px] mt-3 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2.5 transition-all duration-300 disabled:opacity-50 active:scale-[0.97] group login-shimmer-btn font-display"
                style={{
                  background: 'linear-gradient(135deg, hsl(220, 90%, 56%), hsl(220, 80%, 48%), hsl(220, 90%, 56%))',
                  boxShadow: '0 4px 30px hsl(220, 90%, 56% / 0.25), 0 0 0 1px hsl(220, 90%, 56% / 0.15)',
                }}
              >
                {loading ? (
                  <div className="w-5 h-5 border-[2.5px] border-white/20 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    Sign In
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                  </>
                )}
              </button>
            </motion.div>
          </form>

          {/* Footer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="mt-10 pt-6 border-t border-border"
          >
            <div className="flex items-center justify-center gap-2.5">
              <div className="relative">
                <div className="w-2 h-2 rounded-full bg-success" />
                <div className="absolute inset-0 w-2 h-2 rounded-full animate-ping opacity-40 bg-success" />
              </div>
              <span className="text-[11px] text-muted-foreground font-medium">
                System Operational · All Services Running
              </span>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
