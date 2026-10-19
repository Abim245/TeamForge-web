import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { api, errorMessage } from "../api/client";
import TrackBadge from "../components/TrackBadge";
import Badge from "../components/Badge";
import { card } from "../style";
import type { PublicProjectData } from "../type";

const isWebLink = (u: string) => /^https?:\/\//i.test(u);

export default function PublicProject() {
  const { id } = useParams();
  const [project, setProject] = useState<PublicProjectData | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get(`/projects/${id}/public`)
      .then((r) => setProject(r.data.project))
      .catch((e) => setError(errorMessage(e)))
      .finally(() => setLoading(false));
  }, [id]);

  const back = (
    <Link to="/" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800">
      <ArrowLeft size={16} /> Back to showcase
    </Link>
  );

  if (loading) return <p className="p-10 text-slate-500">Loading…</p>;
  if (error || !project) {
    return (
      <div className="mx-auto max-w-4xl px-6 py-10">
        {back}
        <p className="mt-6 text-slate-600">This project is not available. It may not be public yet.</p>
      </div>
    );
  }

  const s = project.submission;
  const links = [
    { label: "Repository", url: s.repoUrl },
    { label: "Demo", url: s.demoUrl },
    { label: "Presentation", url: s.presentationUrl },
    { label: "Documentation", url: s.docsUrl },
  ].filter((l) => l.url && isWebLink(l.url));
  const shots = s.screenshots.filter(isWebLink);

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      {back}
      <div className="mt-6 flex flex-wrap items-center gap-3">
        <TrackBadge track={project.track} />
        {project.label === "WINNER" && <Badge tone="amber">Winner</Badge>}
        {project.label === "FINALIST" && <Badge tone="blue">Finalist</Badge>}
      </div>
      <h1 className="mt-3 text-4xl font-normal tracking-tight">{project.name}</h1>
      <p className="mt-2 text-lg text-slate-500">{project.description}</p>

      {links.length > 0 && (
        <div className="mt-6 flex flex-wrap gap-3">
          {links.map((l) => (
            <a key={l.label} href={l.url} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold hover:bg-slate-50">
              <ExternalLink size={16} /> {l.label}
            </a>
          ))}
        </div>
      )}

      <div className="mt-8 space-y-6">
        {s.summary && (
          <section className={card}>
            <h2 className="text-lg font-semibold">About this project</h2>
            <p className="mt-2 whitespace-pre-wrap text-slate-700">{s.summary}</p>
          </section>
        )}
        {(project.problemStatement || project.proposedSolution) && (
          <section className={`${card} grid gap-6 md:grid-cols-2`}>
            {project.problemStatement && (
              <div>
                <h2 className="text-lg font-semibold">The problem</h2>
                <p className="mt-2 whitespace-pre-wrap text-slate-700">{project.problemStatement}</p>
              </div>
            )}
            {project.proposedSolution && (
              <div>
                <h2 className="text-lg font-semibold">The solution</h2>
                <p className="mt-2 whitespace-pre-wrap text-slate-700">{project.proposedSolution}</p>
              </div>
            )}
          </section>
        )}
        {shots.length > 0 && (
          <section className={card}>
            <h2 className="text-lg font-semibold">Screenshots</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {shots.map((u) => (
                <img key={u} src={u} alt={`${project.name} screenshot`} loading="lazy" referrerPolicy="no-referrer"
                  className="w-full rounded-lg border border-slate-200 object-cover" />
              ))}
            </div>
          </section>
        )}
        <section className={card}>
          <h2 className="text-lg font-semibold">Team</h2>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {project.members.map((m) => (
              <li key={m._id} className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-sm font-medium text-slate-600">
                  {m.name.charAt(0).toUpperCase()}
                </span>
                <div>
                  <p className="text-sm font-medium">{m.name}</p>
                  {m.title && <p className="text-xs text-slate-500">{m.title}</p>}
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}