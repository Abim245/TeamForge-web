import { Route, Routes } from "react-router-dom";
import PublicLayout from "./components/PublicLayout";
import WorkspaceLayout from "./components/WorkspaceLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";
import AdminShell from "./components/AdminShell";
import JudgeRoute from "./components/JudgeRoute";
import MentorRoute from "./components/MentorRoute";
import Home from "./pages/Home";
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
        <Route path="/" element={<Home />} />
        <Route path="/showcase/:id" element={<PublicProject />} />
        <Route path="/announcements" element={<Announcements />} />
        <Route path="/privacy" element={<Privacy />} />
      </Route>

      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      <Route element={<ProtectedRoute />}>
        {/* participants, judges and mentors */}
        <Route element={<WorkspaceLayout />}>
          <Route path="/projects/new" element={<CreateProject />} />
          <Route path="/projects/:id" element={<ProjectDetail />} />
          <Route path="/requests" element={<Requests />} />
          <Route path="/notifications" element={<Notifications />} />

          <Route path="/judging" element={<JudgeRoute />}>
            <Route index element={<Judging />} />
            <Route path=":id" element={<JudgeProject />} />
          </Route>

          <Route path="/mentoring" element={<MentorRoute />}>
            <Route index element={<Mentoring />} />
            <Route path="teams/:id" element={<MentorTeam />} />
          </Route>
        </Route>

        {/* admins get their own dashboard */}
        <Route path="/admin" element={<AdminRoute />}>
          <Route element={<AdminShell />}>
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