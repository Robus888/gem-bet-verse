
import { useEffect, useState, createContext, useContext } from 'react';
import { supabase } from '@/lib/supabase';
import { useNavigate } from 'react-router-dom';

// Create an auth context to share auth state across components
export const AuthContext = createContext<{
  user: any;
  isLoading: boolean;
}>({ user: null, isLoading: true });

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check current auth status
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      setIsLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user);
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const AuthButton = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleAuth = async () => {
    if (user) {
      await supabase.auth.signOut();
    } else {
      navigate('/auth');
    }
  };

  return (
    <button
      onClick={handleAuth}
      className="bg-yellow-500 text-gray-900 px-4 py-2 rounded-lg hover:bg-yellow-400 transition-colors"
    >
      {user ? 'Logout' : 'Login'}
    </button>
  );
};
