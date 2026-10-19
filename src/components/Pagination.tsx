interface Props {
  page: number;
  pages: number;
  onChange: (page: number) => void;
}

export default function Pagination({ page, pages, onChange }: Props) {
  if (pages <= 1) return null;
  const btn = "rounded-lg border border-slate-300 px-3 py-1.5 font-semibold disabled:opacity-40";
  return (
    <div className="mt-4 flex items-center justify-between text-sm text-slate-600">
      <span>Page {page} of {pages}</span>
      <div className="flex gap-2">
        <button disabled={page <= 1} onClick={() => onChange(page - 1)} className={btn}>Previous</button>
        <button disabled={page >= pages} onClick={() => onChange(page + 1)} className={btn}>Next</button>
      </div>
    </div>
  );
}