import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { inputClass } from "../style";

interface Props {
  id: string;
  value: string;
  onChange: (v: string) => void;
  autoComplete?: string;
}

export default function PasswordInput({ id, value, onChange, autoComplete }: Props) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <input
        id={id}
        type={show ? "text" : "password"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoComplete={autoComplete}
        required
        className={`${inputClass} pr-11`}
      />
      <button
        type="button"
        onClick={() => setShow(!show)}
        aria-label={show ? "Hide password" : "Show password"}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-800"
      >
        {show ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    </div>
  );
}