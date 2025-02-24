
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faCrown, faStar } from '@fortawesome/free-solid-svg-icons';
import { supabase } from '@/lib/supabase';
import { useToast } from "@/hooks/use-toast";
import { formatNumber, parseInputValue } from '@/utils/formatNumber';
import { calculateLevel } from '@/utils/levelUtils';
import CoinAnimation from '@/components/CoinAnimation';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { useAuth } from '@/components/AuthButton';

const CoinflipGame = () => {
  const [betAmount, setBetAmount] = useState(500000);
  const [betInput, setBetInput] = useState('500K');
  const [isLoading, setIsLoading] = useState(false);
  const [isFlipping, setIsFlipping] = useState(false);
  const [result, setResult] = useState<'heads' | 'tails' | null>(null);
  const [userChoice, setUserChoice] = useState<'crown' | 'star'>('crown');
  const { toast } = useToast();
  const { user } = useAuth();

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

  const playGame = async () => {
    try {
      setIsLoading(true);
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

      // Deduct bet amount
      const { error: updateError } = await supabase
        .from('wallets')
        .update({ balance: wallet.balance - betAmount })
        .eq('user_id', user.id);

      if (updateError) throw updateError;

      // Determine result and start animation
      const won = Math.random() < 0.5;
      const coinResult = won ? 'heads' : 'tails';
      setResult(coinResult);
      setIsFlipping(true);

      // Check if user won based on their choice
      const userWon = (userChoice === 'crown' && coinResult === 'heads') || 
                     (userChoice === 'star' && coinResult === 'tails');
      const wonAmount = userWon ? betAmount * 2 : 0;

      // Record game history
      await supabase
        .from('game_history')
        .insert({
          user_id: user.id,
          game_type: 'coinflip',
          bet_amount: betAmount,
          result: userWon ? 'win' : 'loss',
          won_amount: wonAmount
        });

      // Update wallet after animation completes
      setTimeout(async () => {
        await supabase
          .from('wallets')
          .update({ 
            balance: wallet.balance - betAmount + wonAmount,
            total_wagered: (wallet.total_wagered || 0) + betAmount,
            level: calculateLevel((wallet.total_wagered || 0) + betAmount)
          })
          .eq('user_id', user.id);

        toast({
          title: userWon ? "You won!" : "You lost!",
          description: userWon ? `You won ${formatNumber(wonAmount)} credits!` : `You lost ${formatNumber(betAmount)} credits!`,
          variant: userWon ? "default" : "destructive",
        });
      }, 3000);

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

  const handleAnimationComplete = () => {
    setIsFlipping(false);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      <Link to="/" className="inline-flex items-center text-yellow-500 hover:text-yellow-400 mb-4">
        <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
        Back to Home
      </Link>

      <div className="flex items-center justify-center min-h-[80vh]">
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg w-80">
          <div className="mb-8">
            <CoinAnimation
              isFlipping={isFlipping}
              result={result}
              userChoice={userChoice}
              onAnimationComplete={handleAnimationComplete}
            />
          </div>

          <div className="mb-4 flex justify-center space-x-4">
            <button
              className={`px-4 py-2 rounded ${userChoice === 'crown' ? 'bg-yellow-500 text-gray-900' : 'bg-gray-700 text-gray-300'}`}
              onClick={() => setUserChoice('crown')}
              disabled={isFlipping}
            >
              <FontAwesomeIcon icon={faCrown} className="mr-2" />
              Crown
            </button>
            <button
              className={`px-4 py-2 rounded ${userChoice === 'star' ? 'bg-yellow-500 text-gray-900' : 'bg-gray-700 text-gray-300'}`}
              onClick={() => setUserChoice('star')}
              disabled={isFlipping}
            >
              <FontAwesomeIcon icon={faStar} className="mr-2" />
              Star
            </button>
          </div>

          <button 
            className={`bg-yellow-500 text-gray-900 font-bold py-2 px-4 rounded w-full mb-4 ${
              isLoading || isFlipping ? 'opacity-50 cursor-not-allowed' : 'hover:bg-yellow-400'
            }`}
            onClick={playGame}
            disabled={isLoading || isFlipping}
          >
            {isLoading ? 'Processing...' : isFlipping ? 'Flipping...' : 'Flip Coin'}
          </button>

          <div className="text-gray-300 mb-2">Play amount (min 500K)</div>
          <div className="bg-gray-700 text-white font-bold py-2 px-4 rounded flex items-center justify-between">
            <div className="flex items-center">
              <FontAwesomeIcon icon={faCrown} className="text-yellow-500 mr-2" />
              <input
                type="text"
                value={betInput}
                onChange={(e) => handleBetInputChange(e.target.value)}
                className="bg-transparent w-24 focus:outline-none"
                disabled={isFlipping}
              />
            </div>
            <div className="flex items-center">
              <button 
                className="bg-gray-700 text-gray-500 font-bold py-1 px-2 rounded mr-2 hover:text-gray-400"
                onClick={() => {
                  const newAmount = Math.max(500000, betAmount / 2);
                  setBetAmount(newAmount);
                  setBetInput(formatNumber(newAmount));
                }}
                disabled={isFlipping}
              >
                1/2
              </button>
              <button 
                className="bg-gray-700 text-gray-500 font-bold py-1 px-2 rounded hover:text-gray-400"
                onClick={() => {
                  const newAmount = betAmount * 2;
                  setBetAmount(newAmount);
                  setBetInput(formatNumber(newAmount));
                }}
                disabled={isFlipping}
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

const Coinflip = () => (
  <ProtectedRoute>
    <CoinflipGame />
  </ProtectedRoute>
);

export default Coinflip;
