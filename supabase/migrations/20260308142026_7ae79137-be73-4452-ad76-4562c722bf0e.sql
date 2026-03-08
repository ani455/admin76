
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TABLE public.users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  mobile TEXT NOT NULL UNIQUE,
  name TEXT,
  balance NUMERIC(12,2) NOT NULL DEFAULT 0,
  total_recharge NUMERIC(12,2) NOT NULL DEFAULT 0,
  total_withdraw NUMERIC(12,2) NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'banned')),
  is_demo BOOLEAN NOT NULL DEFAULT false,
  is_agent BOOLEAN NOT NULL DEFAULT false,
  referral_code TEXT,
  referred_by UUID REFERENCES public.users(id),
  ip_address TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.deposits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  amount NUMERIC(12,2) NOT NULL,
  method TEXT NOT NULL CHECK (method IN ('UPI', 'USDT', 'Bank Transfer')),
  utr TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.deposits ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.withdrawals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  amount NUMERIC(12,2) NOT NULL,
  bank_name TEXT,
  account_no TEXT,
  ifsc TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.withdrawals ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.game_periods (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  game_type TEXT NOT NULL CHECK (game_type IN ('wingo', 'k3', '5d')),
  duration TEXT NOT NULL CHECK (duration IN ('30sec', '1min', '3min', '5min', '10min')),
  period_number TEXT NOT NULL,
  result_number INTEGER,
  result_color TEXT,
  big_small TEXT,
  total_bet NUMERIC(12,2) NOT NULL DEFAULT 0,
  total_win NUMERIC(12,2) NOT NULL DEFAULT 0,
  users_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.game_periods ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.bets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  period_id UUID NOT NULL REFERENCES public.game_periods(id) ON DELETE CASCADE,
  bet_type TEXT NOT NULL,
  bet_value TEXT NOT NULL,
  amount NUMERIC(12,2) NOT NULL,
  win_amount NUMERIC(12,2) DEFAULT 0,
  result TEXT CHECK (result IN ('win', 'lose', 'pending')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.bets ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.game_settings (
  id INTEGER NOT NULL DEFAULT 1 PRIMARY KEY CHECK (id = 1),
  game_mode TEXT NOT NULL DEFAULT 'wingo',
  process_type TEXT NOT NULL DEFAULT 'highest_bet_wins',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.game_settings ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.gift_codes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  amount NUMERIC(12,2) NOT NULL,
  max_uses INTEGER NOT NULL DEFAULT 1,
  used_count INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.gift_codes ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.admin_users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  auth_user_id UUID NOT NULL UNIQUE,
  username TEXT NOT NULL UNIQUE,
  dashboard_access BOOLEAN NOT NULL DEFAULT true,
  wingo_access BOOLEAN NOT NULL DEFAULT false,
  k3_access BOOLEAN NOT NULL DEFAULT false,
  d5_access BOOLEAN NOT NULL DEFAULT false,
  finance_access BOOLEAN NOT NULL DEFAULT false,
  support_access BOOLEAN NOT NULL DEFAULT false,
  manage_access BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.support_queries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  category TEXT NOT NULL CHECK (category IN ('deposit', 'withdrawal', 'ifsc', 'bank', 'game')),
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'resolved', 'closed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.support_queries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin full access users" ON public.users FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin full access deposits" ON public.deposits FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin full access withdrawals" ON public.withdrawals FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin full access game_periods" ON public.game_periods FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin full access bets" ON public.bets FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin full access game_settings" ON public.game_settings FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin full access gift_codes" ON public.gift_codes FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin full access admin_users" ON public.admin_users FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin full access support_queries" ON public.support_queries FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_deposits_updated_at BEFORE UPDATE ON public.deposits FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_withdrawals_updated_at BEFORE UPDATE ON public.withdrawals FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_game_settings_updated_at BEFORE UPDATE ON public.game_settings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_admin_users_updated_at BEFORE UPDATE ON public.admin_users FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_support_queries_updated_at BEFORE UPDATE ON public.support_queries FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.game_settings (id, game_mode, process_type) VALUES (1, 'wingo', 'highest_bet_wins');
