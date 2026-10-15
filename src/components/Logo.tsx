export default function Logo({ light = false }: { light?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <span
        className={`flex h-9 w-9 items-center justify-center rounded-lg text-lg font-bold ${
          light ? "bg-white text-navy" : "bg-brand text-white"
        }`}
      >
        T
      </span>
      <span className={`text-xl font-semibold ${light ? "text-white" : "text-slate-900"}`}>TeamForge</span>
    </div>
  );
}