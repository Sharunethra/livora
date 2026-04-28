import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import SocietiesPage from './pages/SocietiesPage';
import BuildingsPage from './pages/BuildingsPage';
import FlatsPage from './pages/FlatsPage';
import VisitorsPage from './pages/VisitorsPage';
import ResidentsPage from './pages/ResidentsPage';
import ComplaintsPage from './pages/ComplaintsPage';
import MaintenancePage from './pages/MaintenancePage';
import FeedbackPage from './pages/FeedbackPage';
import NoticesPage from './pages/NoticesPage';
import PaymentsPage from './pages/PaymentsPage';
import MainLayout from './components/MainLayout';
import ProtectedRoute from './components/ProtectedRoute';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 1000 * 60 * 5, // 5 minutes
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          
          <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/societies" element={<SocietiesPage />} />
            <Route path="/buildings" element={<BuildingsPage />} />
            <Route path="/flats" element={<FlatsPage />} />
            <Route path="/visitors" element={<VisitorsPage />} />
            <Route path="/residents" element={<ResidentsPage />} />
            <Route path="/complaints" element={<ComplaintsPage />} />
            <Route path="/maintenance" element={<MaintenancePage />} />
            <Route path="/feedback" element={<FeedbackPage />} />
            <Route path="/notices" element={<NoticesPage />} />
            <Route path="/payments" element={<PaymentsPage />} />
            
            {/* Fallback within authenticated layout */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
          </Route>

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
