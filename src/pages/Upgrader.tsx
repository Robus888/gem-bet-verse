
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faArrowUp, faArrowDown } from '@fortawesome/free-solid-svg-icons';
import { supabase } from '@/lib/supabase';
import { useToast } from "@/hooks/use-toast";
import { formatNumber, parseInputValue } from '@/utils/formatNumber';
import { calculateLevel } from '@/utils/levelUtils';

const Upgrader = () => {
  const [betAmount, setBetAmount] = useState(500000);
  const [betInput, setBetInput] = useState('500K');
  const [targetMultiplier, setTargetMultiplier] = useState(2.00);
  const [isOver, setIsOver] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [gameResult, setGameResult] = useState<number | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
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

  const handleMultiplierChange = (value: number) => {
    const newValue = Math.min(Math.max(1.01, value), 1000);
    setTargetMultiplier(parseFloat(newValue.toFixed(2)));
  };

  const calculateWinChance = () => {
    if (isOver) {
      return ((1000 - targetMultiplier) / 1000 * 100).toFixed(2);
    }
    return ((targetMultiplier - 1) / 1000 * 100).toFixed(2);
  };

  const playGame = async () => {
    try {
      setIsLoading(true);
      setIsAnimating(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Check user's balance
      const { data: wallet } = await supabase
        .from('wallets')
        .select('balance, total_wagered')
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

      // Generate random number between 1 and 1000
      const result = Math.random() * 1000;
      setGameResult(result);

      // Determine if won based on target multiplier and over/under choice
      const won = isOver ? result > targetMultiplier : result < targetMultiplier;
      const wonAmount = won ? Math.floor(betAmount * (1000 / targetMultiplier - 1)) : 0;

      // Update wallet
      await supabase
        .from('wallets')
        .update({ 
          balance: wallet.balance - betAmount + wonAmount,
          total_wagered: (wallet.total_wagered || 0) + betAmount,
          level: calculateLevel((wallet.total_wagered || 0) + betAmount)
        })
        .eq('user_id', user.id);

      // Record game history
      await supabase
        .from('game_history')
        .insert({
          user_id: user.id,
          game_type: 'upgrader',
          bet_amount: betAmount,
          result: won ? 'win' : 'loss',
          won_amount: wonAmount
        });

      // Show result after animation
      setTimeout(() => {
        setIsAnimating(false);
        toast({
          title: won ? "You won!" : "You lost!",
          description: won ? `You won ${formatNumber(wonAmount)} credits!` : `You lost ${formatNumber(betAmount)} credits!`,
          variant: won ? "default" : "destructive",
        });
      }, 2000);

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
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-md">
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2">Upgrader</h2>
              <p className="text-gray-400">Win up to 1000x your bet!</p>
            </div>

            <div className="bg-gray-700 p-4 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <span>Target Multiplier</span>
                <span>{targetMultiplier.toFixed(2)}x</span>
              </div>
              <input
                type="range"
                min="1.01"
                max="1000"
                step="0.01"
                value={targetMultiplier}
                onChange={(e) => handleMultiplierChange(parseFloat(e.target.value))}
                className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between mt-2">
                <span>1.01x</span>
                <span>1000x</span>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setIsOver(true)}
                className={`flex-1 py-3 px-4 rounded-lg flex items-center justify-center gap-2 ${
                  isOver ? 'bg-green-500 text-white' : 'bg-gray-700 text-gray-300'
                }`}
              >
                <FontAwesomeIcon icon={faArrowUp} />
                Over
              </button>
              <button
                onClick={() => setIsOver(false)}
                className={`flex-1 py-3 px-4 rounded-lg flex items-center justify-center gap-2 ${
                  !isOver ? 'bg-red-500 text-white' : 'bg-gray-700 text-gray-300'
                }`}
              >
                <FontAwesomeIcon icon={faArrowDown} />
                Under
              </button>
            </div>

            <div className="bg-gray-700 p-4 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <span>Win Chance</span>
                <span>{calculateWinChance()}%</span>
              </div>
              <div className="flex justify-between">
                <span>Potential Win</span>
                <span>{formatNumber(Math.floor(betAmount * (1000 / targetMultiplier - 1)))}</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Bet Amount (min 500K)</label>
              <input
                type="text"
                value={betInput}
                onChange={(e) => handleBetInputChange(e.target.value)}
                className="w-full bg-gray-700 text-white rounded-lg p-3"
                placeholder="Enter bet amount"
              />
              <div className="grid grid-cols-2 gap-2 mt-2">
                <button 
                  className="bg-gray-700 text-gray-300 p-2 rounded-lg hover:bg-gray-600"
                  onClick={() => {
                    const newAmount = Math.max(500000, betAmount / 2);
                    setBetAmount(newAmount);
                    setBetInput(formatNumber(newAmount));
                  }}
                >
                  1/2
                </button>
                <button 
                  className="bg-gray-700 text-gray-300 p-2 rounded-lg hover:bg-gray-600"
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

            <button
              onClick={playGame}
              disabled={isLoading}
              className={`w-full py-4 rounded-lg text-lg font-bold ${
                isLoading
                  ? 'bg-gray-600 cursor-not-allowed'
                  : 'bg-yellow-500 hover:bg-yellow-400 text-gray-900'
              }`}
            >
              {isLoading ? 'Rolling...' : 'Roll'}
            </button>

            {isAnimating && gameResult !== null && (
              <div className="text-center animate-bounce">
                <span className="text-2xl font-bold">
                  {gameResult.toFixed(2)}x
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Upgrader;
