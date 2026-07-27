import { Navigate } from 'react-router';
import { useAuth } from '../context/AuthContext';

/**
 * PublicRoute guards pages that should only be accessible when the user is
 * NOT authenticated (e.g. /login). Authenticated users are redirected to the
 * dashboard or to the originally requested protected page.
 */
export function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (isAuthenticated) {
    const redirectTo = localStorage.getItem('admin_redirect_after_login') || '/';
    localStorage.removeItem('admin_redirect_after_login');
    return <Navigate to={redirectTo} replace />;
  }

  return <>{children}</>;
}
