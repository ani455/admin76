import { useState, useEffect, createContext, useContext, ReactNode } from "react";

interface AdminUser {
  username: string;
  unohs: string;
  is_superadmin: boolean;
  loginAt: number;
}

interface AuthContextType {
  user: AdminUser | null;
  loading: boolean;
  signOut: () => void;
  signIn: (admin: { username: string; unohs: string; is_superadmin: boolean }) => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signOut: () => {},
  signIn: () => {},
});

const STORAGE_KEY = "rivestro_admin_session";

function getStoredAdmin(): AdminUser | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as AdminUser;
    // Session expires after 24 hours
    if (Date.now() - parsed.loginAt > 24 * 60 * 60 * 1000) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = getStoredAdmin();
    setUser(stored);
    setLoading(false);
  }, []);

  const signIn = (admin: { username: string; unohs: string; is_superadmin: boolean }) => {
    const session: AdminUser = { ...admin, loginAt: Date.now() };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    setUser(session);
  };

  const signOut = () => {
    localStorage.removeItem(STORAGE_KEY);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signOut, signIn }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
