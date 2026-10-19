import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import { api } from "../api/client";
import type { Role, Track, User } from "../type";

interface RegisterData {
  name: string;
  email: string;
  password: string;
  track: Track;
  acceptTerms: boolean;
}

interface AuthValue {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthValue | null>(null);

// /auth/me returns _id, login returns id: normalise both
function toUser(u: { id?: string; _id?: string; name: string; email: string; track: Track; role?: Role }): User {
  return { id: (u.id ?? u._id) as string, name: u.name, email: u.email, track: u.track, role: u.role ?? "PARTICIPANT" };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!localStorage.getItem("token")) {
      setLoading(false);
      return;
    }
    api
      .get("/auth/me")
      .then((r) => setUser(toUser(r.data.user)))
      .catch(() => localStorage.removeItem("token"))
      .finally(() => setLoading(false));
  }, []);

  async function login(email: string, password: string) {
    const r = await api.post("/auth/login", { email, password });
    localStorage.setItem("token", r.data.token);
    setUser(toUser(r.data.user));
  }

  async function register(data: RegisterData) {
    const r = await api.post("/auth/register", data);
    localStorage.setItem("token", r.data.token);
    setUser(toUser(r.data.user));
  }

  function logout() {
    localStorage.removeItem("token");
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}