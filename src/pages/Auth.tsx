
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useNavigate } from 'react-router-dom';
import { useToast } from "@/hooks/use-toast";

const Auth = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleAuth = async (type: 'login' | 'signup') => {
    try {
      setIsLoading(true);
      const email = `${username}@gemhustlers.com`;
      
      if (type === 'signup') {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              username,
            },
          },
        });
        
        if (error) throw error;
        toast({
          title: "Account created!",
          description: "Welcome to  Gem Hustlers Casino!",
        });
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        
        if (error) throw error;
      }
      
      navigate('/');
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-8 p-6 bg-gray-800 rounded-xl">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-white">Welcome to Gem Hustlers Casino</h2>
          <p className="mt-2 text-gray-400">Enter your credentials to continue</p>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="text-white" htmlFor="username">Username</label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full p-2 mt-1 bg-gray-700 border border-gray-600 rounded-lg text-white"
              disabled={isLoading}
            />
          </div>
          
          <div>
            <label className="text-white" htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 mt-1 bg-gray-700 border border-gray-600 rounded-lg text-white"
              disabled={isLoading}
            />
          </div>
          
          <div className="flex gap-4">
            <button
              onClick={() => handleAuth('login')}
              disabled={isLoading}
              className="flex-1 bg-yellow-500 text-gray-900 p-2 rounded-lg hover:bg-yellow-400 transition-colors disabled:opacity-50"
            >
              Login
            </button>
            <button
              onClick={() => handleAuth('signup')}
              disabled={isLoading}
              className="flex-1 bg-purple-500 text-white p-2 rounded-lg hover:bg-purple-400 transition-colors disabled:opacity-50"
            >
              Sign Up
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
