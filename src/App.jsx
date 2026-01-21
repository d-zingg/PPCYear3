import { Routes, Route, Navigate } from "react-router-dom";
import { useContext } from "react";

import UserLogin from "./pages/UserLogin";
import UserHome from "./pages/UserHome";
import AdminSchool from "./pages/AdminSchool";
import TeacherDashboard from "./pages/TeacherDashboard";
import StudentDashboard from "./pages/StudentDashboard";
import Settings from "./pages/Settings";

import UserProfile from "./pages/profiles/UserProfile";
import StudentProfile from "./pages/profiles/StudentProfile";
import TeacherProfile from "./pages/profiles/TeacherProfile";
import AdminProfile from "./pages/profiles/AdminProfile";
import PublicProfile from "./pages/profiles/PublicProfile";

import { PostsProvider } from "./context/PostsContext";
import { AssignmentsProvider } from "./context/AssignmentsContext";
import { ClassesProvider } from "./context/ClassesContext";
import { UserProvider, UserContext } from "./context/UserContext";
import { UsersProvider } from "./context/UsersContext";
import { RouteGuard, getDashboardRoute } from "./utils/RouteGuard";

/**
 * ProfileRouter - Implements role-based profile routing
 * Based on the user role flow from diagrams
 */
function ProfileRouter() {
  const { user } = useContext(UserContext) || {};

  // Redirect to login if not authenticated
  if (!user) return <Navigate to="/" replace />;

  // Route to role-specific profile
  if (user.role === "admin") return <AdminProfile />;
  if (user.role === "teacher") return <TeacherProfile />;
  if (user.role === "student") return <StudentProfile />;

  // Fallback to generic profile
  return <UserProfile />;
}

/**
 * ProtectedRoute - Wrapper component for protected routes
 * Implements authentication guard from flow diagrams
 */
function ProtectedRoute({ children, requiredRole = null }) {
  const { user } = useContext(UserContext) || {};

  // Check authentication
  if (!user) {
    return <Navigate to="/" replace />;
  }

  // Check role authorization if required
  if (requiredRole && user.role !== requiredRole) {
    // Redirect to user's appropriate dashboard
    const correctRoute = getDashboardRoute(user.role);
    return <Navigate to={correctRoute} replace />;
  }

  return children;
}

export default function App() {
  return (
    <UserProvider>
      <UsersProvider>
        <PostsProvider>
          <AssignmentsProvider>
            <ClassesProvider>
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<UserLogin />} />

                {/* Protected Routes - Require Authentication */}
                <Route
                  path="/userHome"
                  element={
                    <ProtectedRoute>
                      <UserHome />
                    </ProtectedRoute>
                  }
                />

                {/* Role-Specific Dashboards - Protected by Role */}
                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute requiredRole="admin">
                      <AdminSchool />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/teacher"
                  element={
                    <ProtectedRoute requiredRole="teacher">
                      <TeacherDashboard />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/student"
                  element={
                    <ProtectedRoute requiredRole="student">
                      <StudentDashboard />
                    </ProtectedRoute>
                  }
                />

                {/* Profile Routes - Role-Based */}
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <ProfileRouter />
                    </ProtectedRoute>
                  }
                />

                {/* Public Profile View - Protected */}
                <Route
                  path="/profile/:userId"
                  element={
                    <ProtectedRoute>
                      <PublicProfile />
                    </ProtectedRoute>
                  }
                />

                {/* Settings - Protected */}
                <Route
                  path="/settings"
                  element={
                    <ProtectedRoute>
                      <Settings />
                    </ProtectedRoute>
                  }
                />

                {/* Catch-all redirect */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </ClassesProvider>
          </AssignmentsProvider>
        </PostsProvider>
      </UsersProvider>
    </UserProvider>
  );
}
