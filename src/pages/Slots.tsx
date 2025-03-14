
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faCrown, faDiamond, faStar } from '@fortawesome/free-solid-svg-icons';
import { supabase } from '@/lib/supabase';
import { useToast } from "@/hooks/use-toast";
import { formatNumber, parseInputValue } from '@/utils/formatNumber';
import { calculateLevel } from '@/utils/levelUtils';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { useAuth } from '@/components/AuthButton';

const SlotItem = ({ icon, isSpinning }: { icon: any; isSpinning: boolean }) => (
  <div className="w-24 h-24 bg-gray-800 rounded-lg flex items-center justify-center text-4xl border-2 border-yellow-500 overflow-hidden">
    <div className={`transform ${isSpinning ? 'animate-[spin_0.5s_ease-in-out_infinite]' : ''} transition-all duration-500`}>
      <FontAwesomeIcon icon={icon} className="text-yellow-500" />
    </div>
  </div>
);

const RewardInfo = ({ icons, multiplier }: { icons: any[]; multiplier: string }) => (
  <div className="flex items-center space-x-2 text-lg">
    <div className="flex">
      {icons.map((icon, index) => (
        <FontAwesomeIcon key={index} icon={icon} className="text-yellow-500" />
      ))}
    </div>
    <span>=</span>
    <span>{multiplier}</span>
  </div>
);

const SlotsGame = () => {
  const [slots, setSlots] = useState([faCrown, faCrown, faCrown]);
  const [betAmount, setBetAmount] = useState(500000);
  const [betInput, setBetInput] = useState('500K');
  const [spinningSlots, setSpinningSlots] = useState([false, false, false]);
  const { toast } = useToast();
  const { user } = useAuth();

  const symbols = [
    { icon: faDiamond, weight: 0.1 },  // 10% for diamonds
    { icon: faStar, weight: 0.2 },     // 20% for stars
    { icon: faCrown, weight: 0.3 }     // 30% for crowns
  ];

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

  const getRandomSymbol = () => {
    const rand = Math.random();
    let cumulative = 0;
    
    for (const symbol of symbols) {
      cumulative += symbol.weight;
      if (rand < cumulative) {
        return symbol.icon;
      }
    }
    
    return faCrown;
  };

  const calculateWinnings = (result: any[]) => {
    const counts: { [key: string]: number } = {};
    result.forEach(icon => {
      const key = icon.iconName;
      counts[key] = (counts[key] || 0) + 1;
    });

    if (counts['diamond'] === 3) return betAmount * 3;
    if (counts['star'] === 3) return betAmount * 2;
    if (counts['crown'] === 3) return betAmount * 1.5;
    if (counts['diamond'] === 2 || counts['star'] === 2 || counts['crown'] === 2) return betAmount * 1.1;
    
    return 0;
  };

  const spin = async () => {
    if (!user) return;
    
    try {
      // Start spinning all slots
      setSpinningSlots([true, true, true]);

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
        setSpinningSlots([false, false, false]);
        return;
      }

      // Deduct bet amount
      const { error: updateError } = await supabase
        .from('wallets')
        .update({ balance: wallet.balance - betAmount })
        .eq('user_id', user.id);

      if (updateError) throw updateError;

      // Generate results before the animation
      const newSlots = [getRandomSymbol(), getRandomSymbol(), getRandomSymbol()];
      
      // Stop slots one by one
      setTimeout(() => {
        setSlots(slots => [newSlots[0], slots[1], slots[2]]);
        setSpinningSlots([false, true, true]);
        
        setTimeout(() => {
          setSlots(slots => [slots[0], newSlots[1], slots[2]]);
          setSpinningSlots([false, false, true]);
          
          setTimeout(() => {
            setSlots(newSlots);
            setSpinningSlots([false, false, false]);

            // Calculate winnings after all slots have stopped
            const winAmount = calculateWinnings(newSlots);

            // Record game history
            supabase
              .from('game_history')
              .insert({
                user_id: user.id,
                game_type: 'slots',
                bet_amount: betAmount,
                result: winAmount > 0 ? 'win' : 'loss',
                won_amount: winAmount
              })
              .then(() => {
                // Update wallet
                return supabase
                  .from('wallets')
                  .update({ 
                    balance: wallet.balance - betAmount + winAmount,
                    total_wagered: (wallet.total_wagered || 0) + betAmount,
                    level: calculateLevel((wallet.total_wagered || 0) + betAmount)
                  })
                  .eq('user_id', user.id);
              })
              .then(() => {
                if (winAmount > 0) {
                  toast({
                    title: "You won!",
                    description: `You won ${formatNumber(winAmount)} credits!`,
                  });
                }
              });
          }, 1000); // Third slot stops
        }, 1000); // Second slot stops
      }, 1000); // First slot stops

    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      setSpinningSlots([false, false, false]);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      <Link to="/" className="inline-flex items-center text-yellow-500 hover:text-yellow-400 mb-4">
        <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
        Back to Home
      </Link>

      <div className="flex flex-col lg:flex-row items-start justify-center gap-8 max-w-6xl mx-auto">
        <div className="w-full lg:w-2/3">
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
            <div className="flex justify-center space-x-4 mb-8">
              {slots.map((slot, index) => (
                <SlotItem key={index} icon={slot} isSpinning={spinningSlots[index]} />
              ))}
            </div>

            <div className="space-y-4">
              <div className="text-gray-300 mb-2">Play amount (min 500K)</div>
              <div className="bg-gray-700 text-white font-bold py-2 px-4 rounded flex items-center justify-between">
                <input
                  type="text"
                  value={betInput}
                  onChange={(e) => handleBetInputChange(e.target.value)}
                  className="bg-transparent w-24 focus:outline-none"
                  disabled={spinningSlots.some(s => s)}
                />
                <div className="flex items-center space-x-2">
                  <button 
                    className="bg-gray-600 text-gray-300 px-2 py-1 rounded hover:bg-gray-500"
                    onClick={() => {
                      const newAmount = Math.max(500000, betAmount / 2);
                      setBetAmount(newAmount);
                      setBetInput(formatNumber(newAmount));
                    }}
                    disabled={spinningSlots.some(s => s)}
                  >
                    1/2
                  </button>
                  <button 
                    className="bg-gray-600 text-gray-300 px-2 py-1 rounded hover:bg-gray-500"
                    onClick={() => {
                      const newAmount = betAmount * 2;
                      setBetAmount(newAmount);
                      setBetInput(formatNumber(newAmount));
                    }}
                    disabled={spinningSlots.some(s => s)}
                  >
                    2x
                  </button>
                </div>
              </div>

              <button 
                className={`w-full bg-yellow-500 text-gray-900 font-bold py-3 px-4 rounded ${
                  spinningSlots.some(s => s) ? 'opacity-50 cursor-not-allowed' : 'hover:bg-yellow-400'
                }`}
                onClick={spin}
                disabled={spinningSlots.some(s => s)}
              >
                {spinningSlots.some(s => s) ? 'Spinning...' : 'Spin'}
              </button>
            </div>
          </div>
        </div>

        <div className="w-full lg:w-1/3 bg-gray-800 p-6 rounded-lg">
          <h2 className="text-xl font-bold mb-4">Rewards</h2>
          <div className="space-y-3">
            <RewardInfo icons={[faDiamond, faDiamond, faDiamond]} multiplier="3x (10%)" />
            <RewardInfo icons={[faStar, faStar, faStar]} multiplier="2x (20%)" />
            <RewardInfo icons={[faCrown, faCrown, faCrown]} multiplier="1.5x (30%)" />
            <RewardInfo icons={[faDiamond, faDiamond]} multiplier="1.10x" />
            <RewardInfo icons={[faStar, faStar]} multiplier="1.10x" />
            <RewardInfo icons={[faCrown, faCrown]} multiplier="1.10x" />
          </div>
        </div>
      </div>
    </div>
  );
};

const Slots = () => (
  <ProtectedRoute>
    <SlotsGame />
  </ProtectedRoute>
);

export default Slots;
