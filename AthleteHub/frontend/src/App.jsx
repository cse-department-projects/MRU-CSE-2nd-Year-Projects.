import { Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import DashboardLayout from './layouts/DashboardLayout';
import LandingPage from './pages/LandingPage';
import NotFound from './pages/NotFound';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import DashboardHome from './pages/dashboard/DashboardHome';
import AthleteList from './pages/dashboard/AthleteList';
import AthleteComparison from './pages/dashboard/AthleteComparison';
import CompleteProfile from './pages/dashboard/CompleteProfile';
import AthleteProfile from './pages/dashboard/AthleteProfile';
import AthleteForm from './pages/dashboard/AthleteForm';
import OrganizationList from './pages/dashboard/OrganizationList';
import OrganizationForm from './pages/dashboard/OrganizationForm';
import OrganizationProfile from './pages/dashboard/OrganizationProfile';
import MyOrganizationRedirect from './pages/dashboard/MyOrganizationRedirect';
import CoachList from './pages/dashboard/CoachList';
import CoachForm from './pages/dashboard/CoachForm';
import CoachProfile from './pages/dashboard/CoachProfile';
import CoachDashboard from './pages/dashboard/roles/CoachDashboard';
import PlaybookManager from './pages/dashboard/playbook/PlaybookManager';
import CoachAssignmentDashboard from './pages/dashboard/CoachAssignmentDashboard';
import CoachAssignmentList from './pages/dashboard/CoachAssignmentList';
import CoachAssignmentForm from './pages/dashboard/CoachAssignmentForm';
import CoachAssignmentDetails from './pages/dashboard/CoachAssignmentDetails';
import TrainingDashboard from './pages/dashboard/TrainingDashboard';
import TrainingPlanList from './pages/dashboard/TrainingPlanList';
import TrainingPlanForm from './pages/dashboard/TrainingPlanForm';
import TrainingPlanDetails from './pages/dashboard/TrainingPlanDetails';
import TrainingSessionList from './pages/dashboard/TrainingSessionList';
import TrainingSessionForm from './pages/dashboard/TrainingSessionForm';
import TrainingSessionDetails from './pages/dashboard/TrainingSessionDetails';
import AttendanceManagement from './pages/dashboard/AttendanceManagement';
import TrainingAttendancePage from './pages/dashboard/TrainingAttendancePage';
import Settings from './pages/dashboard/Settings';
import ProfilePage from './pages/dashboard/profile/ProfilePage';
import TeamList from './pages/dashboard/teams/TeamList';
import TeamForm from './pages/dashboard/teams/TeamForm';
import TeamDetails from './pages/dashboard/teams/TeamDetails';
import ProtectedRoute from './components/ProtectedRoute';

// Phase 7: Event & Tournament Management Imports
import EventList from './pages/events/EventList';
import EventForm from './pages/events/EventForm';
import EventDetails from './pages/events/EventDetails';
import TournamentList from './pages/tournaments/TournamentList';
import TournamentForm from './pages/tournaments/TournamentForm';
import TournamentDetails from './pages/tournaments/TournamentDetails';
import MatchCalendarView from './pages/matches/MatchCalendarView';
import MatchTimelineView from './pages/matches/MatchTimelineView';
import MatchDetails from './pages/matches/MatchDetails';

// Recruitment Imports
import RecruitmentDashboard from './pages/recruitment/RecruitmentDashboard';
import AthleteDiscovery from './pages/recruitment/AthleteDiscovery';
import RecruitmentProfile from './pages/recruitment/RecruitmentProfile';
import RecruitmentPipeline from './pages/recruitment/RecruitmentPipeline';
import ShortlistsManagement from './pages/recruitment/ShortlistsManagement';
import RecruitmentTasks from './pages/recruitment/RecruitmentTasks';
import RecruitmentImport from './pages/recruitment/RecruitmentImport';

import DataAcquisitionDashboard from './pages/administration/data-acquisition/DataAcquisitionDashboard';

function App() {
  return (
    <Routes>
      {/* Public Routes with MainLayout */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Route>

      {/* Protected Dashboard Routes */}
      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<DashboardHome />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="complete-profile" element={<CompleteProfile />} />
          
          <Route path="athletes" element={<AthleteList />} />
          <Route path="athletes/compare" element={<AthleteComparison />} />
          <Route path="athletes/new" element={<AthleteForm />} />
          <Route path="athletes/:id" element={<AthleteProfile />} />
          <Route path="athletes/:id/edit" element={<AthleteForm />} />

          <Route path="my-organization" element={<MyOrganizationRedirect />} />
          <Route path="organizations" element={<OrganizationList />} />
          <Route path="organizations/new" element={<OrganizationForm />} />
          <Route path="organizations/:id" element={<OrganizationProfile />} />
          <Route path="organizations/:id/edit" element={<OrganizationForm />} />
          
          {/* Coach Routes */}
          <Route path="coaches" element={<CoachList />} />
          <Route path="coaches/dashboard" element={<CoachDashboard />} />
          <Route path="coaches/playbook" element={<PlaybookManager />} />
          <Route path="coaches/new" element={<CoachForm />} />
          <Route path="coaches/:id" element={<CoachProfile />} />
          <Route path="coaches/:id/edit" element={<CoachForm />} />

          {/* Teams & Squads Routes */}
          <Route path="teams" element={<TeamList />} />
          <Route path="teams/new" element={<TeamForm />} />
          <Route path="teams/:id" element={<TeamDetails />} />
          <Route path="teams/:id/edit" element={<TeamForm />} />
          
          {/* Coach Assignment Routes */}
          <Route path="coach-assignments" element={<CoachAssignmentList />} />
          <Route path="coach-assignments/dashboard" element={<CoachAssignmentDashboard />} />
          <Route path="coach-assignments/new" element={<CoachAssignmentForm />} />
          <Route path="coach-assignments/:id" element={<CoachAssignmentDetails />} />
          <Route path="coach-assignments/:id/edit" element={<CoachAssignmentForm />} />
          
          {/* Training Routes */}
          <Route path="training" element={<TrainingDashboard />} />
          <Route path="training-plans" element={<TrainingPlanList />} />
          <Route path="training-plans/new" element={<TrainingPlanForm />} />
          <Route path="training-plans/:id" element={<TrainingPlanDetails />} />
          <Route path="training-plans/:id/edit" element={<TrainingPlanForm />} />
          
          <Route path="training-sessions" element={<TrainingSessionList />} />
          <Route path="training-sessions/new" element={<TrainingSessionForm />} />
          <Route path="training-sessions/:id" element={<TrainingSessionDetails />} />
          <Route path="training-sessions/:id/edit" element={<TrainingSessionForm />} />
          <Route path="training-sessions/:id/attendance" element={<AttendanceManagement />} />
          <Route path="training/attendance" element={<TrainingAttendancePage />} />
          <Route path="attendance" element={<TrainingAttendancePage />} />
          
          {/* Phase 7: Event & Tournament Management Routes */}
          <Route path="events" element={<EventList />} />
          <Route path="events/new" element={<EventForm />} />
          <Route path="events/:id" element={<EventDetails />} />
          <Route path="events/:id/edit" element={<EventForm />} />
          
          <Route path="tournaments" element={<TournamentList />} />
          <Route path="tournaments/new" element={<TournamentForm />} />
          <Route path="tournaments/:id" element={<TournamentDetails />} />
          <Route path="tournaments/:id/edit" element={<TournamentForm />} />
          
          <Route path="matches/calendar" element={<MatchCalendarView />} />
          <Route path="matches/timeline" element={<MatchTimelineView />} />
          <Route path="matches/:id" element={<MatchDetails />} />

          {/* Recruitment Routes */}
          <Route path="recruitment">
            <Route index element={<RecruitmentDashboard />} />
            <Route path="dashboard" element={<RecruitmentDashboard />} />
            <Route path="discover" element={<AthleteDiscovery />} />
            <Route path="pipeline" element={<RecruitmentPipeline />} />
            <Route path="shortlists" element={<ShortlistsManagement />} />
            <Route path="tasks" element={<RecruitmentTasks />} />
            <Route path="import" element={<RecruitmentImport />} />
            <Route path="prospects/:id" element={<RecruitmentProfile />} />
          </Route>

          {/* Settings & Admin Routes */}
          <Route path="settings" element={<Settings />} />

          {/* Administration Routes */}
          <Route path="imports" element={<DataAcquisitionDashboard />} />
          <Route path="data-acquisition" element={<DataAcquisitionDashboard />} />

          {/* We will add more dashboard routes in future phases */}
        </Route>
      </Route>

      {/* Catch-all route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
