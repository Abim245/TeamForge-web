import { useState } from "react";
import type { FormEvent } from "react";
import { api, errorMessage } from "../api/client";
import { useAuth } from "../context/AutoContext";
import InviteMember from "./InviteMember";
import type { Member, TabProps } from "../type";

function MemberRow({ member, title, isLeadOfTeam, canEdit, projectId, onSaved }: {
  member: Member; title: string; isLeadOfTeam: boolean; canEdit: boolean; projectId: string; onSaved: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(title);
  const [error, setError] = useState("");

  async function save(e: FormEvent) {
    e.preventDefault();
    setError("");
    try {
      await api.put(`/projects/${projectId}/roles/${member._id}`, { title: value.trim() });
      setEditing(false);
      onSaved();
    } catch (err) {
      setError(errorMessage(err));
    }
  }

  return (
    <li className="flex items-start gap-3">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-sm font-medium text-slate-600">
        {member.name.charAt(0).toUpperCase()}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">
          {member.name}
          {isLeadOfTeam && <span className="ml-2 rounded-md bg-blue-50 px-2 py-0.5 text-xs font-semibold text-brand">Lead</span>}
        </p>
        {editing ? (
          <form onSubmit={save} className="mt-1 flex gap-2">
            <input value={value} onChange={(e) => setValue(e.target.value)} minLength={2} maxLength={60} required
              className="min-w-0 flex-1 rounded border border-slate-300 px-2 py-1 text-xs outline-none focus:border-brand" />
            <button type="submit" className="text-xs font-semibold text-brand">Save</button>
          </form>
        ) : (
          <p className="text-xs text-slate-500">
            {title || "No role yet"}
            {canEdit && (
              <button onClick={() => setEditing(true)} className="ml-2 font-semibold text-brand">Edit</button>
            )}
          </p>
        )}
        {error && <p className="text-xs text-red-600">{error}</p>}
      </div>
    </li>
  );
}

export default function TeamPanel({ data, isLead, reload }: TabProps) {
  const { user } = useAuth();
  const p = data.project;
  const { maxTeamSize, minTeamSize } = data.settings;
  const canInvite = isLead && !data.locked && p.members.length < maxTeamSize;

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold">Team</h2>
      <p className="mt-1 text-xs text-slate-500">
        {p.members.length} of {maxTeamSize} members{minTeamSize > 1 ? ` · at least ${minTeamSize} needed to submit` : ""}
      </p>
      <ul className="mt-4 space-y-4">
        {p.members.map((m) => (
          <MemberRow key={m._id} member={m} projectId={p._id} onSaved={reload}
            title={p.roles.find((r) => r.user === m._id)?.title ?? ""}
            isLeadOfTeam={m._id === p.lead._id}
            canEdit={!data.locked && (isLead || m._id === user?.id)} />
        ))}
      </ul>
      {canInvite && <InviteMember projectId={p._id} members={p.members} />}
      {isLead && !data.locked && p.members.length >= maxTeamSize && (
        <p className="mt-4 text-xs text-slate-500">Your team is full.</p>
      )}
    </section>
  );
}