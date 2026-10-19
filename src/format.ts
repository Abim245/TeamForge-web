export function formatDate(iso: string, withTime = false) {
  return new Date(iso).toLocaleString(
    "en-US",
    withTime ? { dateStyle: "medium", timeStyle: "short" } : { dateStyle: "medium" }
  );
}

// ISO string -> value for <input type="datetime-local"> (in the browser's timezone)
export function toLocalInput(iso: string | null) {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}