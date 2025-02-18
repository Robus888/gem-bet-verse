
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faHandPaper, faCrown } from '@fortawesome/free-solid-svg-icons';
import { supabase } from '@/lib/supabase';
import { useToast } from "@/hooks/use-toast";

type Card = {
  suit: string;
  value: string;
  numericValue: number;
};

const Blackjack = () => {
  const [betAmount, setBetAmount] = useState(10);
  const [gameStarted, setGameStarted] = useState(false);
  const [playerHand, setPlayerHand] = useState<Card[]>([]);
  const [dealerHand, setDealerHand] = useState<Card[]>([]);
  const [deck, setDeck] = useState<Card[]>([]);
  const [playerScore, setPlayerScore] = useState(0);
  const [dealerScore, setDealerScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
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

  const createDeck = () => {
    const suits = ['♠', '♣', '♥', '♦'];
    const values = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
    const newDeck: Card[] = [];

    for (const suit of suits) {
      for (const value of values) {
        let numericValue = parseInt(value);
        if (isNaN(numericValue)) {
          if (value === 'A') numericValue = 11;
          else numericValue = 10;
        }
        newDeck.push({ suit, value, numericValue });
      }
    }

    return shuffleDeck(newDeck);
  };

  const shuffleDeck = (deck: Card[]) => {
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    return deck;
  };

  const calculateScore = (hand: Card[]) => {
    let score = 0;
    let aces = 0;

    for (const card of hand) {
      if (card.value === 'A') {
        aces += 1;
      }
      score += card.numericValue;
    }

    while (score > 21 && aces > 0) {
      score -= 10;
      aces -= 1;
    }

    return score;
  };

  const drawCard = () => {
    if (deck.length === 0) return null;
    const newDeck = [...deck];
    const card = newDeck.pop();
    setDeck(newDeck);
    return card;
  };

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

      const newDeck = createDeck();
      setDeck(newDeck);
      
      const playerCards = [newDeck.pop()!, newDeck.pop()!];
      const dealerCards = [newDeck.pop()!];
      
      setPlayerHand(playerCards);
      setDealerHand(dealerCards);
      setPlayerScore(calculateScore(playerCards));
      setDealerScore(calculateScore(dealerCards));
      setGameStarted(true);
      setGameOver(false);
      
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

  const hit = () => {
    const card = drawCard();
    if (!card) return;

    const newHand = [...playerHand, card];
    setPlayerHand(newHand);
    const newScore = calculateScore(newHand);
    setPlayerScore(newScore);

    if (newScore > 21) {
      endGame(false);
    }
  };

  const stand = async () => {
    let currentDealerHand = [...dealerHand];
    let currentDeck = [...deck];
    
    while (calculateScore(currentDealerHand) < 17) {
      const card = currentDeck.pop();
      if (!card) break;
      currentDealerHand.push(card);
    }

    setDealerHand(currentDealerHand);
    setDeck(currentDeck);
    const finalDealerScore = calculateScore(currentDealerHand);
    setDealerScore(finalDealerScore);

    const playerFinalScore = calculateScore(playerHand);
    const won = finalDealerScore > 21 || playerFinalScore > finalDealerScore;
    
    endGame(won);
  };

  const endGame = async (won: boolean) => {
    try {
      setGameOver(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const wonAmount = won ? betAmount * 2 : 0;

      // Get current wallet
      const { data: wallet } = await supabase
        .from('wallets')
        .select('balance, total_wagered')
        .eq('user_id', user.id)
        .single();

      if (!wallet) return;

      // Update wallet
      await supabase
        .from('wallets')
        .update({ 
          balance: wallet.balance + wonAmount,
          total_wagered: (wallet.total_wagered || 0) + betAmount
        })
        .eq('user_id', user.id);

      // Record game history
      await supabase
        .from('game_history')
        .insert({
          user_id: user.id,
          game_type: 'blackjack',
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
    }
  };

  const renderCard = (card: Card) => (
    <div className={`inline-block mx-1 p-2 bg-white rounded-lg text-2xl ${
      card.suit === '♥' || card.suit === '♦' ? 'text-red-500' : 'text-black'
    }`}>
      {card.value}{card.suit}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      <Link to="/" className="inline-flex items-center text-yellow-500 hover:text-yellow-400 mb-4">
        <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
        Back to Home
      </Link>

      <div className="max-w-3xl mx-auto">
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
          {!gameStarted ? (
            <div className="space-y-4">
              <button 
                className={`bg-yellow-500 text-gray-900 font-bold py-2 px-4 rounded w-full ${
                  isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-yellow-400'
                }`}
                onClick={startGame}
                disabled={isLoading}
              >
                Start Game
              </button>

              <div className="text-gray-300 mb-2">Bet amount</div>
              <div className="bg-gray-700 text-white font-bold py-2 px-4 rounded flex items-center justify-between">
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
          ) : (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-lg mb-2">Dealer's Hand ({dealerScore})</h3>
                <div className="space-x-2">
                  {dealerHand.map((card, index) => (
                    <div key={index} className="inline-block">
                      {renderCard(card)}
                    </div>
                  ))}
                </div>
              </div>

              <div className="text-center">
                <h3 className="text-lg mb-2">Your Hand ({playerScore})</h3>
                <div className="space-x-2">
                  {playerHand.map((card, index) => (
                    <div key={index} className="inline-block">
                      {renderCard(card)}
                    </div>
                  ))}
                </div>
              </div>

              {!gameOver && (
                <div className="flex gap-4">
                  <button
                    onClick={hit}
                    className="flex-1 bg-yellow-500 text-gray-900 p-2 rounded-lg hover:bg-yellow-400 transition-colors"
                  >
                    Hit
                  </button>
                  <button
                    onClick={stand}
                    className="flex-1 bg-purple-500 text-white p-2 rounded-lg hover:bg-purple-400 transition-colors"
                  >
                    Stand
                  </button>
                </div>
              )}

              {gameOver && (
                <button
                  onClick={startGame}
                  className="w-full bg-yellow-500 text-gray-900 p-2 rounded-lg hover:bg-yellow-400 transition-colors"
                >
                  Play Again
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Blackjack;
