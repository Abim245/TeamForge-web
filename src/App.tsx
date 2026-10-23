import { Route, Routes } from "react-router-dom";
import PublicLayout from "./components/PublicLayout";
import WorkspaceLayout from "./components/WorkspaceLayout";
import DashboardShell from "./components/DashboardShell";
import ProtectedRoute from "./components/ProtectedRoute";
import ParticipantRoute from "./components/ParticipantRoute";
import AdminRoute from "./components/AdminRoute";
import JudgeRoute from "./components/JudgeRoute";
import MentorRoute from "./components/MentorRoute";
import RootRoute from "./components/RootRoute";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Privacy from "./pages/Privacy";
import PublicProject from "./pages/PublicProject";
import Announcements from "./pages/Announcement";
import Notifications from "./pages/Notification";
import Requests from "./pages/Request";
import CreateProject from "./pages/CreateProject";
import ProjectDetail from "./pages/ProjectDetail";
import Judging from "./pages/Judging";
import JudgeProject from "./pages/JudgeProject";
import Mentoring from "./pages/Mentoring";
import MentorTeam from "./pages/MentorTeam";
import AdminOverview from "./pages/admin/Overview";
import Participants from "./pages/admin/Participant";
import AdminProjects from "./pages/admin/Project";
import ProjectReview from "./pages/admin/ProjectReview";
import AnnouncementsAdmin from "./pages/admin/AnnouncementAdmin";
import SettingsAdmin from "./pages/admin/SettingAdmin";
import JudgingAdmin from "./pages/admin/JudgingAdmin";
import MentoringAdmin from "./pages/admin/MentoringAdmin";

export default function App() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/" element={<RootRoute />} />
        <Route path="/showcase/:id" element={<PublicProject />} />
        <Route path="/announcements" element={<Announcements />} />
        <Route path="/privacy" element={<Privacy />} />
      </Route>

      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      <Route element={<ProtectedRoute />}>
        {/* participants */}
        <Route element={<ParticipantRoute />}>
          <Route element={<WorkspaceLayout />}>
            <Route path="/projects/new" element={<CreateProject />} />
            <Route path="/projects/:id" element={<ProjectDetail />} />
            <Route path="/requests" element={<Requests />} />
            <Route path="/notifications" element={<Notifications />} />
          </Route>
        </Route>

        {/* judges */}
        <Route path="/judging" element={<JudgeRoute />}>
          <Route element={<DashboardShell role="JUDGE" />}>
            <Route index element={<Judging />} />
            <Route path="announcements" element={<Announcements />} />
            <Route path="notifications" element={<Notifications />} />
            <Route path=":id" element={<JudgeProject />} />
          </Route>
        </Route>

        {/* mentors */}
        <Route path="/mentoring" element={<MentorRoute />}>
          <Route element={<DashboardShell role="MENTOR" />}>
            <Route index element={<Mentoring />} />
            <Route path="announcements" element={<Announcements />} />
            <Route path="notifications" element={<Notifications />} />
            <Route path="teams/:id" element={<MentorTeam />} />
          </Route>
        </Route>

        {/* admins */}
        <Route path="/admin" element={<AdminRoute />}>
          <Route element={<DashboardShell role="ADMIN" />}>
            <Route index element={<AdminOverview />} />
            <Route path="participants" element={<Participants />} />
            <Route path="projects" element={<AdminProjects />} />
            <Route path="projects/:id" element={<ProjectReview />} />
            <Route path="announcements" element={<AnnouncementsAdmin />} />
            <Route path="judging" element={<JudgingAdmin />} />
            <Route path="mentoring" element={<MentoringAdmin />} />
            <Route path="settings" element={<SettingsAdmin />} />
            <Route path="notifications" element={<Notifications />} />
          </Route>
        </Route>
      </Route>
    </Routes>
  );
}