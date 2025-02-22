
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faCrown } from '@fortawesome/free-solid-svg-icons';
import { supabase } from '@/lib/supabase';
import { useToast } from "@/hooks/use-toast";
import { formatNumber, parseInputValue } from '@/utils/formatNumber';

// Define the type for jackpot game data
type JackpotGame = {
  id: string;
  creator_id: string;
  joiner_id: string | null;
  creator_bet: number;
  joiner_bet: number | null;
  winner_id: string | null;
  created_at: string;
  joined_at: string | null;
  countdown_end: string | null;
  completed_at: string | null;
  status: 'waiting' | 'playing' | 'completed';
};

const Jackpot = () => {
  const [betAmount, setBetAmount] = useState(500000);
  const [betInput, setBetInput] = useState('500K');
  const [activeGame, setActiveGame] = useState<JackpotGame | null>(null);
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

    // Subscribe to jackpot game updates
    const channel = supabase
      .channel('jackpot_updates')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'jackpot_games' },
        (payload) => {
          if (payload.new && (payload.new as JackpotGame).status !== 'waiting') {
            setActiveGame(payload.new as JackpotGame);
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

  const createGame = async () => {
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

      // Create new jackpot game
      const { data: game, error: gameError } = await supabase
        .from('jackpot_games')
        .insert({
          creator_id: user.id,
          creator_bet: betAmount,
          status: 'waiting'
        })
        .select()
        .single();

      if (gameError) throw gameError;

      // Deduct bet amount from wallet
      const { error: walletError } = await supabase
        .from('wallets')
        .update({ 
          balance: wallet.balance - betAmount,
        })
        .eq('user_id', user.id);

      if (walletError) throw walletError;

      setActiveGame(game);
      toast({
        title: "Game created!",
        description: "Waiting for another player to join...",
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

  const joinGame = async () => {
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

      // Find available game
      const { data: availableGame } = await supabase
        .from('jackpot_games')
        .select('*')
        .eq('status', 'waiting')
        .neq('creator_id', user.id)
        .order('created_at', { ascending: true })
        .limit(1)
        .single();

      if (!availableGame) {
        toast({
          title: "No games available",
          description: "Create a new game instead",
          variant: "destructive",
        });
        return;
      }

      // Join the game
      const now = new Date();
      const countdown = new Date(now.getTime() + 30000); // 30 seconds countdown

      const { data: game, error: gameError } = await supabase
        .from('jackpot_games')
        .update({
          joiner_id: user.id,
          joiner_bet: betAmount,
          status: 'playing',
          joined_at: now.toISOString(),
          countdown_end: countdown.toISOString()
        })
        .eq('id', availableGame.id)
        .select()
        .single();

      if (gameError) throw gameError;

      // Deduct bet amount from wallet
      const { error: walletError } = await supabase
        .from('wallets')
        .update({ 
          balance: wallet.balance - betAmount,
        })
        .eq('user_id', user.id);

      if (walletError) throw walletError;

      setActiveGame(game);
      toast({
        title: "Game joined!",
        description: "The game will start in 30 seconds...",
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
            <h1 className="text-2xl font-bold">Jackpot</h1>
            <p className="text-gray-400">Bet against other players</p>
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
              >
                2x
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button 
              className={`bg-yellow-500 text-gray-900 font-bold py-2 px-4 rounded ${
                isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-yellow-400'
              }`}
              onClick={createGame}
              disabled={isLoading}
            >
              Create Game
            </button>
            <button 
              className={`bg-blue-500 text-white font-bold py-2 px-4 rounded ${
                isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-400'
              }`}
              onClick={joinGame}
              disabled={isLoading}
            >
              Join Game
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Jackpot;
