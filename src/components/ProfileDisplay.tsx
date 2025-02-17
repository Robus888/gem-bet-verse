
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser } from '@fortawesome/free-solid-svg-icons';

interface Profile {
  username: string;
  total_wagered: number;
}

export const ProfileDisplay = () => {
  const [showProfile, setShowProfile] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('username')
          .eq('id', user.id)
          .single();

        const { data: walletData } = await supabase
          .from('wallets')
          .select('total_wagered')
          .eq('user_id', user.id)
          .single();

        if (profileData && walletData) {
          setProfile({
            username: profileData.username,
            total_wagered: walletData.total_wagered || 0
          });
        }
      }
    };

    fetchProfile();
  }, []);

  if (!profile) return null;

  return (
    <div className="relative">
      <button 
        onClick={() => setShowProfile(!showProfile)}
        className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center hover:bg-gray-600 transition-colors"
      >
        <FontAwesomeIcon icon={faUser} className="text-yellow-500" />
      </button>

      {showProfile && (
        <div className="absolute top-12 right-0 bg-gray-800 p-4 rounded-lg shadow-lg min-w-[200px] z-50">
          <div className="text-white mb-2">
            <span className="font-bold">Username:</span> {profile.username}
          </div>
          <div className="text-white">
            <span className="font-bold">Total Wagered:</span> {profile.total_wagered}
          </div>
        </div>
      )}
    </div>
  );
};
