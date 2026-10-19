import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { LogIn } from "lucide-react";
import AuthShell from "../components/AuthShell";
import PasswordInput from "../components/PasswordInput";
import { useAuth } from "../context/AutoContext";
import { errorMessage } from "../api/client";
import { inputClass, labelClass, primaryBtn } from "../style";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from ?? "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await login(email.trim(), password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthShell>
      <h1 className="text-4xl font-normal tracking-tight">Welcome back</h1>
      <p className="mt-2 text-slate-500">Sign in to continue to your team workspace.</p>

      <form onSubmit={onSubmit} className="mt-8 space-y-5">
        {error && <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
        <div>
          <label htmlFor="email" className={labelClass}>Email address <span className="text-red-600">*</span></label>
          <input id="email" type="email" required autoComplete="email" value={email}
            onChange={(e) => setEmail(e.target.value)} className={inputClass} />
        </div>
        <div>
          <label htmlFor="password" className={labelClass}>Password <span className="text-red-600">*</span></label>
          <PasswordInput id="password" value={password} onChange={setPassword} autoComplete="current-password" />
        </div>
         <div className="mt-2 text-right">
            <Link to="/forgot-password" className="text-sm font-semibold text-brand">Forgot password?</Link>
          </div>
        <button type="submit" disabled={busy} className={`${primaryBtn} w-full`}>
          <LogIn size={18} /> {busy ? "Signing in…" : "Sign in"}
        </button>
      </form>

      <p className="mt-6 text-center text-slate-500">
        New to TeamForge? <Link to="/register" className="font-semibold text-brand">Create an account</Link>
      </p>
    </AuthShell>
  );
}