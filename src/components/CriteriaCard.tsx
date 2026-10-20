import { useEffect, useState } from "react";
import { api } from "../api/client";
import { card } from "../style";
import type { Criterion } from "../type";

export default function CriteriaCard() {
  const [criteria, setCriteria] = useState<Criterion[]>([]);

  useEffect(() => {
    api.get("/judging/criteria").then((r) => setCriteria(r.data.criteria)).catch(() => {});
  }, []);

  if (criteria.length === 0) return null;
  const total = criteria.reduce((sum, c) => sum + c.weight, 0);

  return (
    <section className="mt-10">
      <h2 className="text-lg font-semibold">How projects are judged</h2>
      <p className="mt-1 text-sm text-slate-500">
        Every judge scores each project on these criteria. The percentage shows how much each one counts.
      </p>
      <ul className="mt-3 space-y-3">
        {criteria.map((c) => (
          <li key={c._id} className={card}>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="font-semibold">{c.name}</p>
              <span className="text-sm text-slate-500">{Math.round((c.weight / total) * 100)}% · scored out of {c.maxScore}</span>
            </div>
            {c.description && <p className="mt-1 text-sm text-slate-600">{c.description}</p>}
          </li>
        ))}
      </ul>
    </section>
  );
}