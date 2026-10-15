import { Link } from "react-router-dom";
import type { ReactNode } from "react";
import { ArrowLeft } from "lucide-react";
import Logo from "./Logo";

export default function AuthShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <aside className="hidden w-[45%] flex-col justify-between bg-navy p-10 text-white lg:flex">
        <Logo light />
        <div>
          <p className="text-xs font-semibold tracking-widest text-indigo-300">HACKATHON WORKSPACE</p>
          <h2 className="mt-5 text-6xl font-normal leading-tight tracking-tight">
            Build something worth sharing.
          </h2>
          <p className="mt-6 max-w-sm text-lg text-slate-300">
            Bring your team, tasks, and final submission together in one focused workspace.
          </p>
        </div>
        <p className="text-sm text-slate-400">TeamForge · Project submission platform</p>
      </aside>
      <main className="flex-1 bg-white px-6 py-8 lg:px-16">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800">
          <ArrowLeft size={16} /> Back to public projects
        </Link>
        <div className="mx-auto mt-10 max-w-md pb-10">{children}</div>
      </main>
    </div>
  );
}