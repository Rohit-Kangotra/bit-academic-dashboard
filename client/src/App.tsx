import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth, UserRole } from "@/contexts/AuthContext";
import { ReactNode } from "react";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import Courses from "./pages/Courses";
import CourseDetails from "./pages/CourseDetails";
import Skills from "./pages/Skills";
import Activities from "./pages/Activities";
import Assignments from "./pages/Assignments";
import Projects from "./pages/Projects";
import Leaves from "./pages/Leaves";
import ClassView from "./pages/ClassView";
import Analytics from "./pages/Analytics";
import Students from "./pages/Students";
import Attendance from "./pages/Attendance";
import Classroom from "./pages/Classroom";
import Placements from "./pages/Placements";
import ImportCenter from "./pages/ImportCenter";
import Mentees from "./pages/faculty/Mentees";
import FacultyStudentProfile from "./pages/faculty/FacultyStudentProfile";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Protected Route Wrapper
const ProtectedRoute = ({ children, allowedRoles }: { children: ReactNode, allowedRoles?: UserRole[] }) => {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

// Auto-redirect to specific dashboard based on role
const DashboardRedirect = () => {
  const { user, isLoading } = useAuth();
  if (isLoading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;

  if (user.role === "student") return <Navigate to="/student-dashboard" replace />;
  if (user.role === "faculty") return <Navigate to="/faculty-dashboard" replace />;
  if (user.role === "admin") return <Navigate to="/admin-dashboard" replace />;

  return <Navigate to="/login" replace />;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<Login />} />

            {/* Protected Role-Based Dashboards */}
            <Route path="/dashboard" element={<DashboardRedirect />} />
            <Route path="/student-dashboard" element={<ProtectedRoute allowedRoles={['student']}><Dashboard /></ProtectedRoute>} />
            <Route path="/faculty-dashboard" element={<ProtectedRoute allowedRoles={['faculty']}><Dashboard /></ProtectedRoute>} />
            <Route path="/admin-dashboard" element={<ProtectedRoute allowedRoles={['admin']}><Dashboard /></ProtectedRoute>} />
            <Route path="/import-center" element={<ProtectedRoute allowedRoles={['admin']}><ImportCenter /></ProtectedRoute>} />

            {/* Generic Protected Routes */}
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/courses" element={<ProtectedRoute><Courses /></ProtectedRoute>} />
            <Route path="/courses/:courseCode" element={<ProtectedRoute><CourseDetails /></ProtectedRoute>} />
            <Route path="/skills" element={<ProtectedRoute><Skills /></ProtectedRoute>} />
            <Route path="/activities" element={<ProtectedRoute><Activities /></ProtectedRoute>} />
            <Route path="/assignments" element={<ProtectedRoute><Assignments /></ProtectedRoute>} />
            <Route path="/projects" element={<ProtectedRoute><Projects /></ProtectedRoute>} />
            <Route path="/leaves" element={<ProtectedRoute><Leaves /></ProtectedRoute>} />
            <Route path="/class-view" element={<ProtectedRoute><ClassView /></ProtectedRoute>} />
            <Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
            <Route path="/students" element={<ProtectedRoute><Students /></ProtectedRoute>} />
            <Route path="/attendance" element={<ProtectedRoute><Attendance /></ProtectedRoute>} />
            <Route path="/classroom" element={<ProtectedRoute><Classroom /></ProtectedRoute>} />
            <Route path="/placements" element={<ProtectedRoute><Placements /></ProtectedRoute>} />
            <Route path="/faculty/mentees" element={<ProtectedRoute allowedRoles={['faculty']}><Mentees /></ProtectedRoute>} />
            <Route path="/faculty/student/:rollNo" element={<ProtectedRoute allowedRoles={['faculty']}><FacultyStudentProfile /></ProtectedRoute>} />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
