import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';

interface AdminRouteProps {
  children: React.ReactNode;
}

export const AdminRoute = ({ children }: AdminRouteProps) => {
  const { user, isAdmin, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        // Pas connecté → redirection vers /login
        navigate('/login', { replace: true });
      } else if (!isAdmin()) {
        // Seul admin autorisé → redirection vers /
        navigate('/', { replace: true });
      }
    }
  }, [user, isAdmin, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!user || !isAdmin()) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-heading">Redirection en cours...</h2>
          <Loader2 className="h-6 w-6 animate-spin mx-auto mt-4" />
        </div>
      </div>
    );
  }

  return <>{children}</>;
};