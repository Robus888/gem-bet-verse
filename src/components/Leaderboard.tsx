
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { formatNumber } from '@/utils/formatNumber';

type LeaderboardType = 'wager' | 'level';

export const Leaderboard = ({ onClose }: { onClose: () => void }) => {
  const [type, setType] = useState<LeaderboardType>('wager');
  const [leaders, setLeaders] = useState<any[]>([]);

  useEffect(() => {
    const fetchLeaders = async () => {
      const { data } = await supabase
        .from('wallets')
        .select(`
          user_id,
          total_wagered,
          level,
          profiles:user_id (
            username
          )
        `)
        .order(type === 'wager' ? 'total_wagered' : 'level', { ascending: false })
        .limit(10);

      if (data) {
        setLeaders(data);
      }
    };

    fetchLeaders();

    // Subscribe to realtime updates
    const channel = supabase
      .channel('leaderboard_changes')
      .on('postgres_changes', 
        { event: 'UPDATE', schema: 'public', table: 'wallets' },
        () => {
          fetchLeaders();
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [type]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 p-6 rounded-lg max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Leaderboard</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            ✕
          </button>
        </div>

        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setType('wager')}
            className={`flex-1 py-2 px-4 rounded-lg ${
              type === 'wager'
                ? 'bg-yellow-500 text-gray-900'
                : 'bg-gray-700 text-gray-300'
            }`}
          >
            Total Wagered
          </button>
          <button
            onClick={() => setType('level')}
            className={`flex-1 py-2 px-4 rounded-lg ${
              type === 'level'
                ? 'bg-yellow-500 text-gray-900'
                : 'bg-gray-700 text-gray-300'
            }`}
          >
            Level
          </button>
        </div>

        <div className="space-y-2">
          {leaders.map((leader, index) => (
            <div key={leader.user_id} className="bg-gray-700 p-3 rounded-lg flex justify-between items-center">
              <div className="flex items-center gap-3">
                <span className="text-gray-400">#{index + 1}</span>
                <span>{leader.profiles?.username}</span>
              </div>
              <span className="font-bold">
                {type === 'wager' 
                  ? formatNumber(leader.total_wagered)
                  : `Level ${leader.level}`
                }
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
