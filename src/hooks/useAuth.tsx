import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export type UserRole = 'admin' | 'editor' | 'moderator';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  hasRole: (role: UserRole | UserRole[]) => boolean;
  getUserRole: () => UserRole | null;
  isAdmin: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) {
      toast({
        variant: "destructive",
        title: "Erreur de connexion",
        description: error.message,
      });
    } else if (data.user) {
      // Vérifier le rôle et rediriger automatiquement
      const userRole = data.user.app_metadata?.role;
      if (userRole === 'admin') {
        // Redirection automatique vers /admin pour les admins uniquement
        window.location.href = '/admin';
      } else {
        // Rôle non autorisé, redirection vers l'accueil
        window.location.href = '/';
      }
    }
    
    return { error };
  };


  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        variant: "destructive",
        title: "Erreur de déconnexion",
        description: error.message,
      });
    }
  };

  const getUserRole = (): UserRole | null => {
    if (!user?.app_metadata?.role) return null;
    return user.app_metadata.role as UserRole;
  };

  const hasRole = (roles: UserRole | UserRole[]) => {
    const currentRole = getUserRole();
    if (!currentRole) return false;
    const roleArray = Array.isArray(roles) ? roles : [roles];
    return roleArray.includes(currentRole);
  };

  const isAdmin = () => {
    return getUserRole() === 'admin';
  };

  const value = {
    user,
    session,
    loading,
    signIn,
    signOut,
    hasRole,
    getUserRole,
    isAdmin,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};