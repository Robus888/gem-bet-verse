
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faHandPaper, faCrown } from '@fortawesome/free-solid-svg-icons';
import { supabase } from '@/lib/supabase';
import { useToast } from "@/hooks/use-toast";

const Coinflip = () => {
  const [betAmount, setBetAmount] = useState(10);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Check authentication
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/auth');
        toast({
          title: "Authentication required",
          description: "Please login to play games",
          variant: "destructive",
        });
      }
    };
    checkAuth();
  }, [navigate]);

  const adjustBet = (multiplier: number) => {
    setBetAmount(prev => Math.max(10, Math.floor(prev * multiplier)));
  };

  const playGame = async () => {
    try {
      setIsLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Check user's balance
      const { data: wallet } = await supabase
        .from('wallets')
        .select('balance')
        .eq('user_id', user.id)
        .single();

      if (!wallet || wallet.balance < betAmount) {
        toast({
          title: "Insufficient balance",
          description: "Please add more funds to your wallet",
          variant: "destructive",
        });
        return;
      }

      // Deduct bet amount
      const { error: updateError } = await supabase
        .from('wallets')
        .update({ balance: wallet.balance - betAmount })
        .eq('user_id', user.id);

      if (updateError) throw updateError;

      // Simple 50/50 chance
      const won = Math.random() < 0.5;
      const wonAmount = won ? betAmount * 2 : 0;

      // Update wallet balance
      await supabase
        .from('wallets')
        .update({ 
          balance: wallet.balance - betAmount + wonAmount,
          total_wagered: (wallet.total_wagered || 0) + betAmount,
          total_games: (wallet.total_games || 0) + 1
        })
        .eq('user_id', user.id);

      // Record game history
      await supabase
        .from('game_history')
        .insert({
          user_id: user.id,
          game_type: 'coinflip',
          bet_amount: betAmount,
          result: won ? 'win' : 'loss',
          won_amount: wonAmount
        });

      toast({
        title: won ? "You won!" : "You lost!",
        description: won ? `You won ${wonAmount} credits!` : `You lost ${betAmount} credits!`,
        variant: won ? "default" : "destructive",
      });

    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      <Link to="/" className="inline-flex items-center text-yellow-500 hover:text-yellow-400 mb-4">
        <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
        Back to Home
      </Link>

      <div className="flex items-center justify-center min-h-[80vh]">
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg w-80">
          <button 
            className={`bg-yellow-500 text-gray-900 font-bold py-2 px-4 rounded w-full mb-4 ${
              isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-yellow-400'
            }`}
            onClick={playGame}
            disabled={isLoading}
          >
            {isLoading ? 'Flipping...' : 'Flip Coin'}
          </button>

          <div className="text-gray-300 mb-2">Play amount</div>
          <div className="bg-gray-700 text-white font-bold py-2 px-4 rounded flex items-center justify-between mb-4">
            <div className="flex items-center">
              <FontAwesomeIcon icon={faCrown} className="text-yellow-500 mr-2" />
              {betAmount}
            </div>
            <div className="flex items-center">
              <button 
                className="bg-gray-700 text-gray-500 font-bold py-1 px-2 rounded mr-2 hover:text-gray-400"
                onClick={() => adjustBet(0.5)}
              >
                1/2
              </button>
              <button 
                className="bg-gray-700 text-gray-500 font-bold py-1 px-2 rounded hover:text-gray-400"
                onClick={() => adjustBet(2)}
              >
                2x
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Coinflip;
