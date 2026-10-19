import { Link } from "react-router-dom";
import { useAuth } from "../context/AutoContext";
import JoinRequestButton from "./JoinRequestButton";
import TrackBadge from "./TrackBadge";
import Badge from "./Badge";
import { formatDate } from "../format";
import type { ProjectPreview } from "../type";

// What the team sees about their own project's visibility
function visibility(p: ProjectPreview) {
  if (!p.submitted) return { text: "Draft", tone: "gray" as const };
  if (!p.publicConsent) return { text: "Private", tone: "gray" as const };
  if (p.approvalStatus === "APPROVED") return { text: "Public", tone: "green" as const };
  if (p.approvalStatus === "REJECTED") return { text: "Changes requested", tone: "red" as const };
  return { text: "Awaiting review", tone: "amber" as const };
}

export default function ProjectCard({ project }: { project: ProjectPreview }) {
  const { user } = useAuth();
  const isPublic = project.publicConsent && project.approvalStatus === "APPROVED";
  const vis = visibility(project);

  return (
    <article className="flex flex-col rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <TrackBadge track={project.track} />
        <div className="flex gap-2">
          {project.label === "WINNER" && <Badge tone="amber">Winner</Badge>}
          {project.label === "FINALIST" && <Badge tone="blue">Finalist</Badge>}
          {project.isMember ? (
            <Badge tone={vis.tone}>{vis.text}</Badge>
          ) : (
            project.lookingForMembers && <Badge tone="green">Recruiting</Badge>
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
            Created {formatDate(project.createdAt)} · {project.memberCount} {project.memberCount === 1 ? "member" : "members"}
          </p>
        </div>
      </div>

      <div className="mt-5 space-y-3">
        {project.isMember && (
          <Link to={`/projects/${project._id}`} className="block text-sm font-semibold text-brand hover:underline">
            Open workspace
          </Link>
        )}
        {isPublic && (
          <Link to={`/showcase/${project._id}`} className="block text-sm font-semibold text-brand hover:underline">
            View project
          </Link>
        )}
        {!project.isMember && project.lookingForMembers && (
          <div className="space-y-3">
            <p className="text-sm text-slate-600">
              <span className="font-semibold">Looking for:</span> {project.lookingFor || "teammates"}
            </p>
            {user ? (
              <JoinRequestButton projectId={project._id} />
            ) : (
              <Link to="/login" className="text-sm font-semibold text-brand hover:underline">Sign in to request to join</Link>
            )}
          </div>
        )}
      </div>
    </article>
  );
}