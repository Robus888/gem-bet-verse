import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser } from '@fortawesome/free-solid-svg-icons';
import { formatNumber } from '@/utils/formatNumber';

interface Profile {
  username: string;
  total_wagered: number;
  level: number;
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
          .select('total_wagered, level')
          .eq('user_id', user.id)
          .single();

        if (profileData && walletData) {
          setProfile({
            username: profileData.username,
            total_wagered: walletData.total_wagered || 0,
            level: walletData.level || 0
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
        className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center hover:bg-gray-600 transition-colors relative"
      >
        <FontAwesomeIcon icon={faUser} className="text-yellow-500" />
        <span className="absolute -bottom-1 -right-1 bg-yellow-500 text-xs text-gray-900 rounded-full w-5 h-5 flex items-center justify-center">
          {profile.level}
        </span>
      </button>

      {showProfile && (
        <div className="absolute top-12 right-0 bg-gray-800 p-4 rounded-lg shadow-lg min-w-[200px] z-50">
          <div className="text-white mb-2">
            <span className="font-bold">Username:</span> {profile.username}
          </div>
          <div className="text-white mb-2">
            <span className="font-bold">Level:</span> {profile.level}
          </div>
          <div className="text-white">
            <span className="font-bold">Total Wagered:</span> {formatNumber(profile.total_wagered)}
          </div>
        </div>
      )}
    </div>
  );
};
