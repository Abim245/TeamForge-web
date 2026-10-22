export type Track = "AI" | "DATA_SCIENCE" | "CYBERSECURITY";
export type Role = "PARTICIPANT" | "MENTOR" | "JUDGE" | "ADMIN";
export type ApprovalStatus = "PENDING" | "APPROVED" | "REJECTED";
export type ProjectLabel = "NONE" | "FINALIST" | "WINNER";

export const TRACK_LABELS: Record<Track, string> = {
  AI: "AI",
  DATA_SCIENCE: "Data Science",
  CYBERSECURITY: "Cybersecurity",
};

export const ROLES: Role[] = ["PARTICIPANT", "MENTOR", "JUDGE", "ADMIN"];

export interface User {
  id: string;
  name: string;
  email: string;
  track: Track;
  role: Role;
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
  label: ProjectLabel;
  publicConsent: boolean;
  approvalStatus: ApprovalStatus;
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
  termsAcceptedAt?: string;
  termsVersion?: string;
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
  publicConsent: boolean;
  approvalStatus: ApprovalStatus;
  approvalNote: string;
  label: ProjectLabel;
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

export interface NotificationItem {
  _id: string;
  type: string;
  title: string;
  body: string;
  link: string;
  read: boolean;
  createdAt: string;
}

export interface AnnouncementItem {
  _id: string;
  title: string;
  body: string;
  kind: "ANNOUNCEMENT" | "DEADLINE" | "PRESENTATION";
  eventDate?: string;
  createdAt: string;
}

export interface SettingsData {
  submissionDeadline: string | null;
  minTeamSize: number;
  maxTeamSize: number;
  maxTeamsPerUser: number;
}

export interface PublicProjectData {
  _id: string;
  name: string;
  description: string;
  track: Track;
  label: ProjectLabel;
  problemStatement: string;
  proposedSolution: string;
  members: { _id: string; name: string; track: Track; title: string }[];
  submission: {
    summary: string;
    repoUrl: string;
    demoUrl: string;
    presentationUrl: string;
    docsUrl: string;
    screenshots: string[];
  };
}

export interface AdminStats {
  users: number;
  usersByTrack: Record<string, number>;
  projects: number;
  submitted: number;
  awaitingReview: number;
  approved: number;
  recruiting: number;
}

export interface AdminUser {
  _id: string;
  name: string;
  email: string;
  track: Track;
  role: Role;
  team: string;
  createdAt: string;
}

export interface AdminProjectRow {
  _id: string;
  name: string;
  track: Track;
  submitted: boolean;
  publicConsent: boolean;
  approvalStatus: ApprovalStatus;
  label: ProjectLabel;
  memberCount: number;
  lead: { _id: string; name: string; email: string } | null;
  createdAt: string;
}

export type JudgingStatus = "CLOSED" | "OPEN" | "FINALIZED";
export type ScoreStatus = "NOT_STARTED" | "DRAFT" | "SUBMITTED" | "CONFLICT";

export interface Criterion {
  _id: string;
  name: string;
  description: string;
  weight: number;
  maxScore: number;
}

export interface JudgeProjectRow {
  _id: string;
  name: string;
  description: string;
  track: Track;
  status: ScoreStatus;
}

export interface JudgeProjectDetail {
  status: JudgingStatus;
  criteria: Criterion[];
  project: {
    _id: string;
    name: string;
    description: string;
    track: Track;
    problemStatement: string;
    proposedSolution: string;
    members: { _id: string; name: string; title: string }[];
    submission: {
      summary: string;
      repoUrl: string;
      demoUrl: string;
      presentationUrl: string;
      docsUrl: string;
      screenshots: string[];
    };
  };
  score: {
    status: "DRAFT" | "SUBMITTED" | "CONFLICT";
    scores: { criterion: string; value: number }[];
    feedback: string;
    conflictBy: "JUDGE" | "ADMIN" | null;
    conflictNote: string;
  } | null;
}

export interface JudgingOverview {
  status: JudgingStatus;
  resultsPublished: boolean;
  minJudgesPerProject: number;
  criteria: Criterion[];
  counts: { judges: number; eligibleProjects: number; submittedScores: number; conflicts: number; drafts: number };
  judges: { _id: string; name: string; email: string; submitted: number }[];
}

export interface ResultJudge {
  scoreId: string;
  judgeId: string;
  name: string;
  status: "DRAFT" | "SUBMITTED" | "CONFLICT";
  conflictBy: "JUDGE" | "ADMIN" | null;
  total: number | null;
}

export interface ResultRow {
  projectId: string;
  name: string;
  track: Track;
  judgeCount: number;
  conflicts: number;
  drafts: number;
  average: number | null;
  perCriterion: { criterion: string; name: string; average: number; maxScore: number }[];
  judges: ResultJudge[];
  rank: number | null;
}

export interface JudgingFeedback {
  label: ProjectLabel;
  rank: number | null;
  average: number | null;
  judgeCount: number;
  perCriterion: { criterion: string; name: string; average: number; maxScore: number }[];
  comments: string[];
}


export type SessionStatus = "PROPOSED" | "CONFIRMED" | "CANCELLED" | "COMPLETED";

export interface MentorRef {
  _id: string;
  name: string;
}

export interface SessionItem {
  _id: string;
  project: { _id: string; name: string } | null;
  mentor: MentorRef | null;
  startsAt: string;
  endsAt: string;
  durationMinutes: number;
  topic: string;
  meetingLink: string;
  status: SessionStatus;
  proposedBy: "TEAM" | "MENTOR";
  youAre: "TEAM" | "MENTOR";
  canConfirm: boolean;
  canComplete: boolean;
  canChange: boolean;
}

export interface MentorFeedbackItem {
  _id: string;
  mentor?: MentorRef | null;
  summary: string;
  strengths: string;
  improvements: string;
  nextSteps: string;
  createdAt: string;
}

export interface MentoringData {
  mentors: MentorRef[];
  canRequest: boolean;
  request: {
    _id: string;
    topic: string;
    message: string;
    status: "PENDING" | "ASSIGNED" | "DECLINED";
    note: string;
    createdAt: string;
  } | null;
  sessions: SessionItem[];
  feedback: MentorFeedbackItem[];
}

export interface MentorTeamRow {
  _id: string;
  name: string;
  description: string;
  track: Track;
  submitted: boolean;
  memberCount: number;
}

export interface MentorTeamDetail {
  project: {
    _id: string;
    name: string;
    description: string;
    track: Track;
    submitted: boolean;
    problemStatement: string;
    proposedSolution: string;
    members: { _id: string; name: string; title: string }[];
    milestones: { _id: string; title: string; dueDate?: string; done: boolean }[];
    updates: { _id: string; text: string; createdAt: string; author: string }[];
    submission: {
      summary: string;
      repoUrl: string;
      demoUrl: string;
      presentationUrl: string;
      docsUrl: string;
      screenshots: string[];
    };
  };
  tasks: { _id: string; title: string; status: "TODO" | "DONE"; assignee: string; links: string[] }[];
  sessions: SessionItem[];
  feedback: MentorFeedbackItem[];
}

type AdminRef = { _id: string; name: string; email?: string; track?: Track } | null;

export interface AdminMentoring {
  maxMentorsPerProject: number;
  requests: {
    _id: string;
    topic: string;
    message: string;
    createdAt: string;
    project: AdminRef;
    requestedBy: AdminRef;
  }[];
  assignments: { _id: string; project: AdminRef; mentor: AdminRef }[];
  mentors: { _id: string; name: string; email: string; activeTeams: number }[];
}