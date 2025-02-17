
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLink, faHome, faBars, faCoins } from '@fortawesome/free-solid-svg-icons';
import { WalletDisplay } from '@/components/WalletDisplay';
import { AuthButton } from '@/components/AuthButton';
import { Link } from 'react-router-dom';

const Index = () => {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="p-4">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center">
            <FontAwesomeIcon icon={faLink} className="text-yellow-500 text-2xl" />
          </div>
          <div className="flex items-center space-x-2">
            <AuthButton />
            <WalletDisplay />
            <div className="bg-gray-800 p-2 rounded-lg flex items-center space-x-2">
              <button className="bg-gray-700 text-white px-2 py-1 rounded-lg">
                FUN
              </button>
              <button className="bg-yellow-500 text-gray-900 px-2 py-1 rounded-lg">
                GAME
              </button>
            </div>
          </div>
        </div>

        <h1 className="text-2xl font-bold mb-4">Popular games</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link to="/coinflip" className="block">
            <div className="bg-gradient-to-b from-purple-500 to-blue-500 p-4 rounded-lg relative hover:transform hover:scale-105 transition-transform">
              <img
                src="https://storage.googleapis.com/a1aa/image/o3q0sS4dv-2j-s5_kLnOtj30GMLYTQA9lfUFMm7qC5c.jpg"
                alt="Coinflip"
                className="mx-auto mb-4 w-24 h-24 object-cover"
              />
              <h2 className="text-center text-xl font-bold">COINFLIP</h2>
              <span className="absolute bottom-2 left-2 bg-blue-500 text-white px-2 py-1 rounded-lg">
                Popular
              </span>
            </div>
          </Link>

          <Link to="/blackjack" className="block">
            <div className="bg-gradient-to-b from-pink-500 to-orange-500 p-4 rounded-lg relative hover:transform hover:scale-105 transition-transform">
              <img
                src="https://storage.googleapis.com/a1aa/image/dJWOUyvcmOT3Jb_aH47rbdXPbh6kGZk3rkwK8h5VAgQ.jpg"
                alt="Blackjack"
                className="mx-auto mb-4 w-24 h-24 object-cover"
              />
              <h2 className="text-center text-xl font-bold">BLACKJACK</h2>
              <span className="absolute bottom-2 left-2 bg-gray-500 text-white px-2 py-1 rounded-lg">
                Popular
              </span>
            </div>
          </Link>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-gray-800 p-4 flex justify-around">
        <Link to="/" className="flex flex-col items-center">
          <FontAwesomeIcon icon={faHome} className="text-yellow-500 text-2xl" />
          <span className="text-sm">Home</span>
        </Link>
        <div className="flex flex-col items-center">
          <FontAwesomeIcon icon={faBars} className="text-gray-500 text-2xl" />
          <span className="text-sm">Menu</span>
        </div>
        <div className="flex flex-col items-center">
          <FontAwesomeIcon icon={faCoins} className="text-gray-500 text-2xl" />
          <span className="text-sm">Credits</span>
        </div>
      </div>
    </div>
  );
};

export default Index;
