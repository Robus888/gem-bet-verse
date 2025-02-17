
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export const AuthButton = () => {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleAuth = async () => {
    if (user) {
      await supabase.auth.signOut();
    } else {
      // Redirect to auth page
      window.location.href = '/auth';
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
