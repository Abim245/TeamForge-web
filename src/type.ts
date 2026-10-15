export type Track = "AI" | "DATA_SCIENCE" | "CYBERSECURITY";

export const TRACK_LABELS: Record<Track, string> = {
  AI: "AI",
  DATA_SCIENCE: "Data Science",
  CYBERSECURITY: "Cybersecurity",
};

export interface User {
  id: string;
  name: string;
  email: string;
  track: Track;
}

export interface SearchUser {
  _id: string;
  name: string;
  email: string;
  track: Track;
}

export interface ProjectPreview {
  _id: string;
  name: string;
  description: string;
  track: Track;
  submitted: boolean;
  createdAt: string;
  lead: { _id: string; name: string };
  isMember: boolean;
}

export interface Member {
  _id: string;
  name: string;
  email: string;
  track: Track;
}

export interface ProjectDetailData {
  _id: string;
  name: string;
  description: string;
  track: Track;
  submitted: boolean;
  createdAt: string;
  lead: Member;
  members: Member[];
}

export interface Task {
  _id: string;
  title: string;
  status: "TODO" | "DONE";
  assignee: Member;
  uploads: { fileUrl: string; uploadedAt: string }[];
}