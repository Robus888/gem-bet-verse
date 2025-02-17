
import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCrown } from '@fortawesome/free-solid-svg-icons';
import { supabase } from '@/lib/supabase';

export const WalletDisplay = () => {
  const [balance, setBalance] = useState<number>(0);

  useEffect(() => {
    const fetchBalance = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: wallet } = await supabase
          .from('wallets')
          .select('balance')
          .eq('user_id', user.id)
          .single();
        
        if (wallet) {
          setBalance(wallet.balance);
        }
      }
    };

    fetchBalance();
    
    const channel = supabase
      .channel('balance_updates')
      .on('postgres_changes', 
        { event: 'UPDATE', schema: 'public', table: 'wallets' },
        (payload) => {
          setBalance(payload.new.balance);
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, []);

  const handleAddFunds = () => {
    window.open('https://discord.gg/ytncnjTD', '_blank');
  };

  return (
    <div className="bg-gray-800 p-2 rounded-lg flex items-center space-x-2">
      <span className="animate-fadeIn">{balance.toFixed(2)}</span>
      <FontAwesomeIcon icon={faCrown} className="text-yellow-500" />
      <button 
        onClick={handleAddFunds}
        className="bg-yellow-500 text-gray-900 px-2 py-1 rounded-lg hover:bg-yellow-400 transition-colors"
      >
        +
      </button>
    </div>
  );
};
