import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useSearchParams } from "react-router-dom";
import AuthShell from "../components/AuthShell";
import PasswordInput from "../components/PasswordInput";
import { api, errorMessage } from "../api/client";
import { labelClass, primaryBtn } from "../style";

export default function ResetPassword() {
  const [params] = useSearchParams();
  const token = params.get("token") ?? "";
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    if (password.length < 8) return setError("Password must be at least 8 characters");
    if (password !== confirm) return setError("Passwords do not match");
    setBusy(true);
    try {
      await api.post("/auth/reset-password", { token, password });
      setDone(true);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthShell>
      <h1 className="text-4xl font-normal tracking-tight">Choose a new password</h1>

      {!token ? (
        <p className="mt-6 text-slate-600">
          This link is missing its token. <Link to="/forgot-password" className="font-semibold text-brand">Request a new one.</Link>
        </p>
      ) : done ? (
        <div className="mt-6">
          <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">Your password was updated.</p>
          <Link to="/login" className={`${primaryBtn} mt-6 w-full`}>Sign in</Link>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="mt-8 space-y-5">
          {error && <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
          <div>
            <label htmlFor="password" className={labelClass}>New password</label>
            <PasswordInput id="password" value={password} onChange={setPassword} autoComplete="new-password" />
          </div>
          <div>
            <label htmlFor="confirm" className={labelClass}>Confirm new password</label>
            <PasswordInput id="confirm" value={confirm} onChange={setConfirm} autoComplete="new-password" />
          </div>
          <button type="submit" disabled={busy} className={`${primaryBtn} w-full`}>
            {busy ? "Saving…" : "Update password"}
          </button>
        </form>
      )}
    </AuthShell>
  );
}