
import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCrown } from '@fortawesome/free-solid-svg-icons';
import { supabase } from '@/lib/supabase';

export const WalletDisplay = () => {
  const [balance, setBalance] = useState<number | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const fetchBalance = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setIsAuthenticated(true);
        const { data: wallet } = await supabase
          .from('wallets')
          .select('balance')
          .eq('user_id', user.id)
          .single();
        
        if (wallet) {
          setBalance(wallet.balance);
        }
      } else {
        setIsAuthenticated(false);
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
    window.open('https://discord.gg/ekyfYnbA', '_blank');
  };

  if (!isAuthenticated) return null;

  return (
    <div className="bg-gray-800 p-2 rounded-lg flex items-center space-x-2">
      <span className="animate-fadeIn">{balance?.toFixed(2) ?? '0.00'}</span>
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
