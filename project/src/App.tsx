import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/lib/auth';
import { ThemeProvider } from '@/lib/theme';
import { ToastProvider } from '@/lib/toast';
import { AppLayout } from '@/components/AppLayout';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { FullPageSpinner } from '@/components/Spinner';
import { LandingPage } from '@/pages/LandingPage';
import { LoginPage } from '@/pages/LoginPage';
import { SignupPage } from '@/pages/SignupPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { ResumePage } from '@/pages/ResumePage';
import { InterviewSetupPage } from '@/pages/InterviewSetupPage';
import { InterviewSessionPage } from '@/pages/InterviewSessionPage';
import { InterviewReportPage } from '@/pages/InterviewReportPage';
import { CompaniesPage } from '@/pages/CompaniesPage';
import { RoadmapPage } from '@/pages/RoadmapPage';
import { ProfilePage } from '@/pages/ProfilePage';
import { InterviewHistoryPage } from '@/pages/InterviewHistoryPage';

function RootRedirect() {
  const { session, loading } = useAuth();
  if (loading) return <FullPageSpinner />;
  return <Navigate to={session ? '/dashboard' : '/landing'} replace />;
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ToastProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<RootRedirect />} />
              <Route path="/landing" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />

              <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/resume" element={<ResumePage />} />
                <Route path="/interview/setup" element={<InterviewSetupPage />} />
                <Route path="/interview/session" element={<InterviewSessionPage />} />
                <Route path="/interview/:id/report" element={<InterviewReportPage />} />
                <Route path="/interviews" element={<InterviewHistoryPage />} />
                <Route path="/companies" element={<CompaniesPage />} />
                <Route path="/roadmap" element={<RoadmapPage />} />
                <Route path="/profile" element={<ProfilePage />} />
              </Route>

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </ToastProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
