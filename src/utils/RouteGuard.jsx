import { useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../context/UserContext';

/**
 * RouteGuard: Protects routes based on user authentication and role
 * Implements the authorization flow from the diagrams
 */
export function RouteGuard({ children, requiredRole }) {
  const navigate = useNavigate();
  const { user } = useContext(UserContext) || {};

  useEffect(() => {
    // Step 1: Check if user is authenticated
    if (!user) {
      // Redirect to login if not authenticated
      navigate('/', { replace: true });
      return;
    }

    // Step 2: Check if user has required role
    if (requiredRole && user.role !== requiredRole) {
      // Redirect to appropriate dashboard based on actual role
      const dashboardMap = {
        admin: '/admin',
        teacher: '/teacher',
        student: '/student'
      };
      navigate(dashboardMap[user.role] || '/userHome', { replace: true });
    }
  }, [user, requiredRole, navigate]);

  // Only render children if authenticated and authorized
  if (!user || (requiredRole && user.role !== requiredRole)) {
    return null;
  }

  return children;
}

/**
 * Determines the correct dashboard route based on user role
 * Implements the role-based routing logic from the flow diagrams
 */
export function getDashboardRoute(role) {
  const normalizedRole = (role || '').toLowerCase().trim();
  
  switch (normalizedRole) {
    case 'admin':
    case 'adminschool':
      return '/admin';
    case 'teacher':
      return '/teacher';
    case 'student':
    case 'students':
      return '/student';
    default:
      return '/userHome';
  }
}

/**
 * Validates user session and redirects if invalid
 * Implements session validation from the flow diagrams
 */
export function useAuthValidation() {
  const navigate = useNavigate();
  const { user } = useContext(UserContext) || {};

  useEffect(() => {
    // Check localStorage for persisted session
    const storedUser = localStorage.getItem('ppc_user');
    const storedRole = localStorage.getItem('ppc_role');

    if (!user && !storedUser) {
      navigate('/', { replace: true });
    }
  }, [user, navigate]);

  return { user, isAuthenticated: !!user };
}
