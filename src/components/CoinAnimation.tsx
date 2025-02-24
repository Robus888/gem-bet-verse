
import { useState, useEffect } from 'react';

interface CoinAnimationProps {
  isFlipping: boolean;
  result: 'heads' | 'tails' | null;
  onAnimationComplete: () => void;
}

const CoinAnimation = ({ isFlipping, result, onAnimationComplete }: CoinAnimationProps) => {
  const [rotations, setRotations] = useState(0);

  useEffect(() => {
    if (isFlipping) {
      setRotations(prev => prev + 1080 + (result === 'heads' ? 360 : 180)); // 3 full rotations + final position
      
      // Animation duration matches the CSS transition
      const timer = setTimeout(() => {
        onAnimationComplete();
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [isFlipping, result]);

  return (
    <div className="relative w-40 h-40 mx-auto perspective-1000">
      <div
        className={`relative w-full h-full transition-transform duration-[3000ms] ease-out preserve-3d ${
          isFlipping ? 'animate-bounce' : ''
        }`}
        style={{
          transform: `rotateY(${rotations}deg)`,
        }}
      >
        {/* Heads side */}
        <div className="absolute w-full h-full backface-hidden">
          <div className="w-full h-full rounded-full bg-yellow-500 flex items-center justify-center shadow-lg border-4 border-yellow-600">
            <span className="text-4xl">👑</span>
          </div>
        </div>
        
        {/* Tails side */}
        <div 
          className="absolute w-full h-full backface-hidden"
          style={{ transform: 'rotateY(180deg)' }}
        >
          <div className="w-full h-full rounded-full bg-yellow-400 flex items-center justify-center shadow-lg border-4 border-yellow-600">
            <span className="text-4xl">🌟</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoinAnimation;
