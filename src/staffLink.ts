import type { Role } from "./type";

export function homeFor(role: Role | undefined) {
  if (role === "ADMIN") return "/admin";
  if (role === "JUDGE") return "/judging";
  if (role === "MENTOR") return "/mentoring";
  return "/";
}

// Admins, judges and mentors live inside their own dashboard, so a notification link
// is translated to a page inside it. Anything meant for participants goes to their home
export function linkFor(role: Role | undefined, link: string) {
  if (!link) return link;
  if (role !== "ADMIN" && role !== "JUDGE" && role !== "MENTOR") return link;
  const home = homeFor(role);
  if (link === "/announcements") return role === "ADMIN" ? "/admin/announcements" : `${home}/announcements`;
  if (link.startsWith(home)) return link;
  return home;
}