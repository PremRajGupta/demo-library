import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { AuthProvider, useAuth } from './context/AuthContext';
import MainLayout from './components/layout/MainLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import NewAdmission from './pages/NewAdmission';
import FeeCollection from './pages/FeeCollection';
import SeatMap from './pages/SeatMap';
import Requests from './pages/Requests';
import StudentRecords from './pages/StudentRecords';
import EditStudent from './pages/EditStudent';
import Reports from './pages/Reports';
import PdfGenerator from './pages/PdfGenerator';
import WebsiteSettings from './pages/WebsiteSettings';
import ComputerCenterAdmin from './pages/ComputerCenterAdmin';
import Index from './pages/Index';
import About from './pages/About';
import Services from './pages/Services';
import StudentPortal from './pages/StudentPortal';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';
import ComputerCenter from './pages/ComputerCenter';
import AllCourses from './pages/AllCourses';
import ComputerCenterRegistration from './pages/ComputerCenterRegistration';

function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#f1f5f9]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3b82f6]" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== 'admin') {
    return <Navigate to="/student-portal" replace />;
  }

  return <>{children}</>;
}

function StudentRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#f1f5f9]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3b82f6]" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== 'student') {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}

function PublicLoginRoute() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#f1f5f9]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3b82f6]" />
      </div>
    );
  }

  if (user) {
    if (user.role === 'admin') {
      return <Navigate to="/dashboard" replace />;
    } else if (user.role === 'student') {
      return <Navigate to="/student-portal" replace />;
    }
  }

  return <Login />;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/about" element={<About />} />
      <Route path="/services" element={<Services />} />
      
      {/* Legacy URL Redirects */}
      <Route path="/privacy-policy" element={<Navigate to="/privacypolicy" replace />} />
      <Route path="/terms-of-service" element={<Navigate to="/termsofservice" replace />} />
      <Route path="/computer-center" element={<Navigate to="/computercenter" replace />} />

      {/* Main Pages */}
      <Route path="/privacypolicy" element={<PrivacyPolicy />} />
      <Route path="/termsofservice" element={<TermsOfService />} />
      <Route path="/computercenter" element={<ComputerCenter />} />
      <Route path="/computercenter/courses" element={<AllCourses />} />
      <Route path="/computercenter/registration" element={<ComputerCenterRegistration />} />
      <Route path="/login" element={<PublicLoginRoute />} />

      {/* Admin Protected Routes */}
      <Route
        element={
          <AdminRoute>
            <MainLayout />
          </AdminRoute>
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/admission" element={<NewAdmission />} />
        <Route path="/fees" element={<FeeCollection />} />
        <Route path="/pdf-generator" element={<PdfGenerator />} />
        <Route path="/seat-map" element={<SeatMap />} />
        <Route path="/requests" element={<Requests />} />
        <Route path="/students" element={<StudentRecords />} />
        <Route path="/students/edit/:id" element={<EditStudent />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/computer-center-settings" element={<ComputerCenterAdmin />} />
        <Route path="/website-settings" element={<WebsiteSettings />} />
      </Route>

      {/* Student Protected Route */}
      <Route
        path="/student-portal"
        element={
          <StudentRoute>
            <StudentPortal />
          </StudentRoute>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <HelmetProvider>
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </HelmetProvider>
  );
}

export default App;
