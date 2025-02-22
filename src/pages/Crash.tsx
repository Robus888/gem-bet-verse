
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faCrown, faRocket } from '@fortawesome/free-solid-svg-icons';
import { supabase } from '@/lib/supabase';
import { useToast } from "@/hooks/use-toast";
import { formatNumber, parseInputValue } from '@/utils/formatNumber';
import { CrashGame, CrashBet } from '@/types/crash';

const Crash = () => {
  const [betAmount, setBetAmount] = useState(500000);
  const [betInput, setBetInput] = useState('500K');
  const [activeGame, setActiveGame] = useState<CrashGame | null>(null);
  const [activeBet, setActiveBet] = useState<CrashBet | null>(null);
  const [currentMultiplier, setCurrentMultiplier] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
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

    // Subscribe to game and bet updates
    const channel = supabase
      .channel('crash_updates')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'crash_games' },
        (payload) => {
          if (payload.new) {
            setActiveGame(payload.new as CrashGame);
          }
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [navigate]);

  const handleBetInputChange = (input: string) => {
    setBetInput(input);
    try {
      const value = parseInputValue(input);
      if (value < 500000) {
        toast({
          title: "Invalid bet amount",
          description: "Minimum bet is 500K",
          variant: "destructive",
        });
        setBetAmount(500000);
        setBetInput('500K');
      } else {
        setBetAmount(value);
      }
    } catch (e) {
      toast({
        title: "Invalid input",
        description: "Please enter a valid number with K, M, B, or T suffix",
        variant: "destructive",
      });
    }
  };

  const placeBet = async () => {
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

      // Check if there's an active game
      const { data: game } = await supabase
        .from('crash_games')
        .select('*')
        .eq('status', 'waiting')
        .limit(1)
        .single();

      if (!game) {
        toast({
          title: "No active game",
          description: "Please wait for the next round",
          variant: "destructive",
        });
        return;
      }

      // Place bet
      const { data: bet, error: betError } = await supabase
        .from('crash_bets')
        .insert({
          user_id: user.id,
          game_id: game.id,
          amount: betAmount,
        })
        .select()
        .single();

      if (betError) throw betError;

      // Deduct bet amount from wallet
      const { error: walletError } = await supabase
        .from('wallets')
        .update({ 
          balance: wallet.balance - betAmount,
        })
        .eq('user_id', user.id);

      if (walletError) throw walletError;

      setActiveBet(bet);
      toast({
        title: "Bet placed!",
        description: "Good luck!",
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

  const cashOut = async () => {
    try {
      setIsLoading(true);
      if (!activeBet || !activeGame) return;

      const wonAmount = Math.floor(activeBet.amount * currentMultiplier);

      // Update bet
      const { error: betError } = await supabase
        .from('crash_bets')
        .update({
          cashout_multiplier: currentMultiplier,
          cashed_out_at: new Date().toISOString(),
          status: 'won',
          won_amount: wonAmount,
        })
        .eq('id', activeBet.id)
        .select()
        .single();

      if (betError) throw betError;

      // Add winnings to wallet
      const { error: walletError } = await supabase
        .from('wallets')
        .update({
          balance: supabase.sql`balance + ${wonAmount}`,
        })
        .eq('user_id', activeBet.user_id);

      if (walletError) throw walletError;

      setActiveBet(null);
      toast({
        title: "Cashed out!",
        description: `You won ${formatNumber(wonAmount)}!`,
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
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg w-96">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold">Crash</h1>
            <p className="text-gray-400">Watch the rocket fly and cash out before it crashes!</p>
          </div>

          <div className="text-gray-300 mb-2">Bet amount (min 500K)</div>
          <div className="bg-gray-700 text-white font-bold py-2 px-4 rounded flex items-center justify-between mb-4">
            <div className="flex items-center">
              <FontAwesomeIcon icon={faCrown} className="text-yellow-500 mr-2" />
              <input
                type="text"
                value={betInput}
                onChange={(e) => handleBetInputChange(e.target.value)}
                className="bg-transparent w-24 focus:outline-none"
                disabled={isLoading || activeBet !== null}
              />
            </div>
            <div className="flex items-center">
              <button 
                className="bg-gray-600 text-gray-300 font-bold py-1 px-2 rounded mr-2 hover:bg-gray-500"
                onClick={() => {
                  const newAmount = Math.max(500000, betAmount / 2);
                  setBetAmount(newAmount);
                  setBetInput(formatNumber(newAmount));
                }}
                disabled={isLoading || activeBet !== null}
              >
                1/2
              </button>
              <button 
                className="bg-gray-600 text-gray-300 font-bold py-1 px-2 rounded hover:bg-gray-500"
                onClick={() => {
                  const newAmount = betAmount * 2;
                  setBetAmount(newAmount);
                  setBetInput(formatNumber(newAmount));
                }}
                disabled={isLoading || activeBet !== null}
              >
                2x
              </button>
            </div>
          </div>

          <div className="text-center mb-4">
            <div className="text-4xl font-bold mb-2">
              {currentMultiplier.toFixed(2)}x
            </div>
            <FontAwesomeIcon 
              icon={faRocket} 
              className="text-yellow-500 text-4xl" 
              style={{ 
                transform: `translateY(-${(currentMultiplier - 1) * 20}px)`,
                transition: 'transform 0.2s ease-out'
              }} 
            />
          </div>

          {activeBet ? (
            <button 
              className={`w-full bg-green-500 text-white font-bold py-2 px-4 rounded ${
                isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-green-400'
              }`}
              onClick={cashOut}
              disabled={isLoading}
            >
              Cash Out
            </button>
          ) : (
            <button 
              className={`w-full bg-yellow-500 text-gray-900 font-bold py-2 px-4 rounded ${
                isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-yellow-400'
              }`}
              onClick={placeBet}
              disabled={isLoading}
            >
              Place Bet
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Crash;
