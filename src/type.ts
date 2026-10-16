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

export interface Member {
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
  lookingForMembers: boolean;
  lookingFor: string;
  memberCount: number;
}

export interface Milestone {
  _id: string;
  title: string;
  dueDate?: string;
  done: boolean;
}

export interface Submission {
  summary: string;
  repoUrl: string;
  demoUrl: string;
  presentationUrl: string;
  docsUrl: string;
  screenshots: string[];
  submittedAt?: string;
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
  problemStatement: string;
  proposedSolution: string;
  lookingForMembers: boolean;
  lookingFor: string;
  roles: { user: string; title: string }[];
  updates: { _id: string; author: { _id: string; name: string } | null; text: string; createdAt: string }[];
  milestones: Milestone[];
  submission: Submission;
}

export interface Task {
  _id: string;
  title: string;
  status: "TODO" | "DONE";
  assignee: Member;
  uploads: { fileUrl: string; uploadedAt: string }[];
}

export interface WorkspaceData {
  project: ProjectDetailData;
  locked: boolean;
  settings: { submissionDeadline: string | null; minTeamSize: number; maxTeamSize: number };
}

export interface TabProps {
  data: WorkspaceData;
  isLead: boolean;
  reload: () => void;
}