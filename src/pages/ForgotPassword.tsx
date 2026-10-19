import { useState } from "react";
import type { FormEvent } from "react";
import { Link } from "react-router-dom";
import AuthShell from "../components/AuthShell";
import { api, errorMessage } from "../api/client";
import { inputClass, labelClass, primaryBtn } from "../style";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const r = await api.post("/auth/forgot-password", { email: email.trim() });
      setDone(r.data.message);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthShell>
      <h1 className="text-4xl font-normal tracking-tight">Forgot your password?</h1>
      <p className="mt-2 text-slate-500">Enter your email and we will send you a link to choose a new one.</p>

      {done ? (
        <p className="mt-8 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{done}</p>
      ) : (
        <form onSubmit={onSubmit} className="mt-8 space-y-5">
          {error && <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
          <div>
            <label htmlFor="email" className={labelClass}>Email address</label>
            <input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} />
          </div>
          <button type="submit" disabled={busy} className={`${primaryBtn} w-full`}>
            {busy ? "Sending…" : "Send reset link"}
          </button>
        </form>
      )}
      <p className="mt-6 text-center text-slate-500">
        <Link to="/login" className="font-semibold text-brand">Back to sign in</Link>
      </p>
    </AuthShell>
  );
}