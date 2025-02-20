
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from "@/hooks/use-toast";
import { getLevelReward } from '@/utils/levelUtils';
import { format } from 'date-fns';

export const LevelRewards = ({ onClose }: { onClose: () => void }) => {
  const [currentLevel, setCurrentLevel] = useState(0);
  const [lastClaim, setLastClaim] = useState<Date | null>(null);
  const [canClaim, setCanClaim] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchLevelAndClaim = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: wallet } = await supabase
        .from('wallets')
        .select('level, last_reward_claim')
        .eq('user_id', user.id)
        .single();

      if (wallet) {
        setCurrentLevel(wallet.level || 0);
        setLastClaim(wallet.last_reward_claim ? new Date(wallet.last_reward_claim) : null);
        
        // Check if can claim
        if (!wallet.last_reward_claim) {
          setCanClaim(true);
        } else {
          const lastClaimDate = new Date(wallet.last_reward_claim);
          const today = new Date();
          setCanClaim(
            lastClaimDate.getDate() !== today.getDate() ||
            lastClaimDate.getMonth() !== today.getMonth() ||
            lastClaimDate.getFullYear() !== today.getFullYear()
          );
        }
      }
    };

    fetchLevelAndClaim();
  }, []);

  const handleClaim = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const reward = getLevelReward(currentLevel);

      // Record the claim
      const { error: rewardError } = await supabase
        .from('level_rewards')
        .insert({
          user_id: user.id,
          level: currentLevel,
          amount: reward
        });

      if (rewardError) throw rewardError;

      // Update wallet
      const { error: walletError } = await supabase
        .from('wallets')
        .update({
          balance: supabase.sql`balance + ${reward}`,
          last_reward_claim: new Date().toISOString()
        })
        .eq('user_id', user.id);

      if (walletError) throw walletError;

      toast({
        title: "Reward Claimed!",
        description: `You received ${reward.toLocaleString()} credits!`,
      });

      setCanClaim(false);
      setLastClaim(new Date());
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 p-6 rounded-lg max-w-sm w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Level Rewards</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            ✕
          </button>
        </div>

        <div className="space-y-4">
          <div className="bg-gray-700 p-4 rounded-lg">
            <div className="text-lg mb-2">Current Level: {currentLevel}</div>
            <div className="text-sm text-gray-300">
              Daily Reward: {getLevelReward(currentLevel).toLocaleString()} credits
            </div>
            {lastClaim && (
              <div className="text-sm text-gray-400">
                Last Claimed: {format(lastClaim, 'PPP')}
              </div>
            )}
          </div>

          <button
            onClick={handleClaim}
            disabled={!canClaim}
            className={`w-full py-2 px-4 rounded-lg ${
              canClaim 
                ? 'bg-yellow-500 text-gray-900 hover:bg-yellow-400' 
                : 'bg-gray-600 text-gray-400 cursor-not-allowed'
            }`}
          >
            {canClaim ? 'Claim Reward' : 'Already Claimed Today'}
          </button>
        </div>
      </div>
    </div>
  );
};
