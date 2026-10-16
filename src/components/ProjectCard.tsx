import { Link } from "react-router-dom";
import { useAuth } from "../context/AutoContext";
import JoinRequestButton from "./JoinRequestButton";
import { TRACK_LABELS } from "../type";
import type { ProjectPreview, Track } from "../type";

const trackStyle: Record<Track, string> = {
  AI: "bg-indigo-50 text-indigo-700",
  DATA_SCIENCE: "bg-blue-50 text-blue-700",
  CYBERSECURITY: "bg-amber-50 text-amber-800",
};

export default function ProjectCard({ project }: { project: ProjectPreview }) {
  const { user } = useAuth();
  const date = new Date(project.createdAt).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
  });

  return (
    <article className="flex flex-col rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between gap-2">
        <span className={`rounded-md px-2.5 py-1 text-xs font-semibold ${trackStyle[project.track]}`}>
          {TRACK_LABELS[project.track]}
        </span>
        <div className="flex gap-2">
          {project.lookingForMembers && !project.isMember && (
            <span className="rounded-md bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">Recruiting</span>
          )}
          {project.submitted ? (
            <span className="flex items-center gap-1.5 rounded-md bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" /> Submitted
            </span>
          ) : (
            <span className="flex items-center gap-1.5 rounded-md bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
              <span className="h-1.5 w-1.5 rounded-full bg-slate-500" /> Draft
            </span>
          )}
        </div>
      </div>

      <h3 className="mt-5 text-lg font-medium text-slate-900">{project.name}</h3>
      <p className="mt-2 line-clamp-2 text-slate-500">{project.description}</p>

      <div className="mt-5 flex items-center gap-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-sm font-medium text-slate-600">
          {project.lead.name.charAt(0).toUpperCase()}
        </span>
        <div>
          <p className="text-sm font-medium text-slate-900">{project.lead.name}</p>
          <p className="text-sm text-slate-500">
            Created {date} · {project.memberCount} {project.memberCount === 1 ? "member" : "members"}
          </p>
        </div>
      </div>

      <div className="mt-5">
        {project.isMember ? (
          <Link to={`/projects/${project._id}`} className="text-sm font-semibold text-brand hover:underline">
            Open workspace
          </Link>
        ) : project.lookingForMembers ? (
          <div className="space-y-3">
            <p className="text-sm text-slate-600">
              <span className="font-semibold">Looking for:</span> {project.lookingFor || "teammates"}
            </p>
            {user ? (
              <JoinRequestButton projectId={project._id} />
            ) : (
              <Link to="/login" className="text-sm font-semibold text-brand hover:underline">
                Sign in to request to join
              </Link>
            )}
          </div>
        ) : (
          <span className="text-sm font-medium text-slate-500">Public submission</span>
        )}
      </div>
    </article>
  );
}