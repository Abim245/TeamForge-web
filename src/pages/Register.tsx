import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { UserPlus } from "lucide-react";
import AuthShell from "../components/AuthShell";
import PasswordInput from "../components/PasswordInput";
import TrackSelect from "../components/TrackSelect";
import { useAuth } from "../context/AutoContext";
import { errorMessage } from "../api/client";
import { inputClass, labelClass, primaryBtn } from "../style";
import type { Track } from "../type";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [track, setTrack] = useState<Track | "">("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    if (password.length < 8) return setError("Password must be at least 8 characters");
    if (password !== confirm) return setError("Passwords do not match");
    if (!track) return setError("Please choose your track");

    setBusy(true);
    try {
      await register({ name: name.trim(), email: email.trim(), password, track });
      navigate("/", { replace: true });
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthShell>
      <h1 className="text-4xl font-normal tracking-tight">Create your account</h1>
      <p className="mt-2 text-slate-500">Join a team or start a project for your challenge track.</p>

      <form onSubmit={onSubmit} className="mt-8 space-y-5">
        {error && <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
        <div>
          <label htmlFor="name" className={labelClass}>Full name <span className="text-red-600">*</span></label>
          <input id="name" required value={name} onChange={(e) => setName(e.target.value)} className={inputClass} />
        </div>
        <div>
          <label htmlFor="email" className={labelClass}>Email address <span className="text-red-600">*</span></label>
          <input id="email" type="email" required autoComplete="email" value={email}
            onChange={(e) => setEmail(e.target.value)} className={inputClass} />
        </div>
        <div>
          <label htmlFor="password" className={labelClass}>Password <span className="text-red-600">*</span></label>
          <PasswordInput id="password" value={password} onChange={setPassword} autoComplete="new-password" />
          <p className="mt-2 text-sm text-slate-500">Use at least 8 characters.</p>
        </div>
        <div>
          <label htmlFor="confirm" className={labelClass}>Confirm password <span className="text-red-600">*</span></label>
          <PasswordInput id="confirm" value={confirm} onChange={setConfirm} autoComplete="new-password" />
        </div>
        <div>
          <label htmlFor="track" className={labelClass}>Challenge track <span className="text-red-600">*</span></label>
          <TrackSelect id="track" value={track} onChange={setTrack} placeholder="Choose your track" />
        </div>
        <button type="submit" disabled={busy} className={`${primaryBtn} w-full`}>
          <UserPlus size={18} /> {busy ? "Creating account…" : "Create account"}
        </button>
      </form>

      <p className="mt-6 text-center text-slate-500">
        Already have an account? <Link to="/login" className="font-semibold text-brand">Sign in</Link>
      </p>
    </AuthShell>
  );
}