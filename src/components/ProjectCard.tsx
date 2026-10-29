import { Link } from "react-router-dom";
import { useAuth } from "../context/AutoContext";
import JoinRequestButton from "./JoinRequestButton";
import Badge from "./Badge";
import { formatDate } from "../format";
import { TRACK_LABELS } from "../type";
import type { ProjectPreview, Track } from "../type";

const trackStyle: Record<Track, string> = {
  AI: "bg-[#bfc2ff] text-royal",
  CYBERSECURITY: "bg-gold text-royal",
  DATA_SCIENCE: "bg-[#7a4a2a] text-white",
};

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
  const link = "block text-sm font-semibold text-gold hover:underline";

  return (
    <article className="flex flex-col rounded-2xl border border-[#26268a] bg-ink-soft p-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className={`rounded-md px-2.5 py-1 text-xs font-semibold ${trackStyle[project.track]}`}>
          {TRACK_LABELS[project.track]}
        </span>
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

      <h3 className="mt-4 text-lg font-semibold text-white">{project.name}</h3>
      <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-indigo-200">{project.description}</p>

      <div className="mt-5 flex items-center gap-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-sm font-medium text-white">
          {project.lead.name.charAt(0).toUpperCase()}
        </span>
        <div>
          <p className="text-sm font-medium text-white">{project.lead.name}</p>
          <p className="text-sm text-indigo-300">
            Created {formatDate(project.createdAt)} · {project.memberCount} {project.memberCount === 1 ? "member" : "members"}
          </p>
        </div>
      </div>

      <div className="mt-5 space-y-3">
        {project.isMember && <Link to={`/projects/${project._id}`} className={link}>Open workspace</Link>}
        {isPublic && <Link to={`/showcase/${project._id}`} className={link}>View project</Link>}
        {!project.isMember && project.lookingForMembers && (
          <div className="space-y-3">
            <p className="text-sm text-indigo-100">
              <span className="font-semibold text-white">Looking for:</span> {project.lookingFor || "teammates"}
            </p>
            {user ? (
              <JoinRequestButton projectId={project._id} />
            ) : (
              <Link to="/login" className={link}>Sign in to request to join</Link>
            )}
          </div>
        )}
      </div>
    </article>
  );
}