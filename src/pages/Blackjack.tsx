
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faHandPaper, faCrown } from '@fortawesome/free-solid-svg-icons';
import { supabase } from '@/lib/supabase';
import { useToast } from "@/hooks/use-toast";

const Blackjack = () => {
  const [betAmount, setBetAmount] = useState(10);
  const [gameStarted, setGameStarted] = useState(false);
  const [playerHand, setPlayerHand] = useState<string[]>([]);
  const [dealerHand, setDealerHand] = useState<string[]>([]);
  const [gameResult, setGameResult] = useState<string | null>(null);
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
    setBetAmount(prev => Math.max(10, prev * multiplier));
  };

  const startGame = async () => {
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

      // Start game
      setGameStarted(true);
      // Implement actual game logic here
      toast({
        title: "Game not available",
        description: "This game mode is currently under development",
      });
      
      // Refund bet amount since game is not implemented
      await supabase
        .from('wallets')
        .update({ balance: wallet.balance })
        .eq('user_id', user.id);
        
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
            onClick={startGame}
            disabled={isLoading}
          >
            Play
          </button>

          <div className="grid grid-cols-2 gap-2 mb-4">
            <button className="bg-gray-700 text-gray-500 font-bold py-2 px-4 rounded flex items-center justify-center">
              <FontAwesomeIcon icon={faHandPaper} className="mr-2" />Hit
            </button>
            <button className="bg-gray-700 text-gray-500 font-bold py-2 px-4 rounded flex items-center justify-center">
              <FontAwesomeIcon icon={faHandPaper} className="mr-2" />Stand
            </button>
            <button className="bg-gray-700 text-gray-500 font-bold py-2 px-4 rounded flex items-center justify-center">
              <FontAwesomeIcon icon={faHandPaper} className="mr-2" />Double
            </button>
            <button className="bg-gray-700 text-gray-500 font-bold py-2 px-4 rounded flex items-center justify-center">
              <FontAwesomeIcon icon={faHandPaper} className="mr-2" />Split
            </button>
          </div>

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

export default Blackjack;
