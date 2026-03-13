import AuthForm from '@/components/admin/AuthForm';
import { useAuth } from '@/hooks/useAuth';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Si déjà connecté avec un rôle admin, rediriger vers /admin
    if (user && isAdmin()) {
      navigate('/admin', { replace: true });
    } else if (user && !isAdmin()) {
      // Si connecté mais rôle non autorisé, rediriger vers l'accueil
      navigate('/', { replace: true });
    }
  }, [user, isAdmin, navigate]);

  return <AuthForm />;
};

export default Login;