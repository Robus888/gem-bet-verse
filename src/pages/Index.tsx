import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLink, faHome, faBars, faCoins, faTimes } from '@fortawesome/free-solid-svg-icons';
import { WalletDisplay } from '@/components/WalletDisplay';
import { AuthButton } from '@/components/AuthButton';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import { ProfileDisplay } from '@/components/ProfileDisplay';
import { AdminPanel } from '@/components/AdminPanel';

const Index = () => {
  const [showCredits, setShowCredits] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const handleDiscordClick = () => {
    window.open('https://discord.gg/ekyfYnbA', '_blank');
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white relative">
      <div className="p-4">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center space-x-2">
            <FontAwesomeIcon icon={faLink} className="text-yellow-500 text-2xl" />
            <h1 className="text-xl font-bold text-white">Gem Hustlers Casino</h1>
          </div>
          <div className="flex items-center space-x-2">
            <ProfileDisplay />
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

      {/* Credits Modal */}
      {showCredits && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-lg max-w-sm w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Credits</h2>
              <button onClick={() => setShowCredits(false)}>
                <FontAwesomeIcon icon={faTimes} className="text-gray-400 hover:text-white transition-colors" />
              </button>
            </div>
            <div className="space-y-2">
              <p className="text-gray-300">Owner: leone2008dogg</p>
              <p className="text-gray-300">Developer: Elmejorsiuuu</p>
            </div>
          </div>
        </div>
      )}

      {/* Menu Modal */}
      {showMenu && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-lg max-w-sm w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Menu</h2>
              <button onClick={() => setShowMenu(false)}>
                <FontAwesomeIcon icon={faTimes} className="text-gray-400 hover:text-white transition-colors" />
              </button>
            </div>
            <button 
              onClick={handleDiscordClick}
              className="w-full flex items-center space-x-3 px-4 py-3 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
            >
              <svg width="22" height="22" viewBox="0 0 14 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M11.847 1.553A11.323 11.323 0 0 0 9 .667a.06.06 0 0 0-.047.02c-.12.22-.26.506-.353.726-1.06-.16-2.14-.16-3.2 0a6.686 6.686 0 0 0-.36-.726c-.007-.014-.027-.02-.047-.02-1 .173-1.953.473-2.846.886-.007 0-.014.007-.02.014C.313 4.28-.187 6.92.06 9.533c0 .014.007.027.02.034a11.58 11.58 0 0 0 3.493 1.766c.02.007.04 0 .047-.013.267-.367.507-.753.713-1.16.014-.027 0-.053-.026-.06-.38-.147-.74-.32-1.094-.52-.026-.013-.026-.053-.006-.073.073-.054.146-.114.22-.167a.041.041 0 0 1 .046-.007c2.294 1.047 4.767 1.047 7.034 0a.041.041 0 0 1 .046.007c.074.06.147.113.22.173.027.02.027.06-.006.074a7.154 7.154 0 0 1-1.094.52c-.026.006-.033.04-.026.06.213.406.453.793.713 1.16.02.006.04.013.06.006 1.147-.353 2.3-.886 3.5-1.766a.037.037 0 0 0 .02-.034c.293-3.02-.487-5.64-2.067-7.966-.006-.007-.013-.014-.026-.014ZM4.68 7.94c-.687 0-1.26-.633-1.26-1.413s.56-1.414 1.26-1.414c.707 0 1.267.64 1.26 1.414 0 .78-.56 1.413-1.26 1.413Zm4.647 0c-.687 0-1.26-.633-1.26-1.413s.56-1.414 1.26-1.414c.706 0 1.266.64 1.26 1.414 0 .78-.554 1.413-1.26 1.413Z" fill="url(#discord_svg__a)"/>
                <defs>
                  <linearGradient id="discord_svg__a" x1="7.001" y1="0.667" x2="7.001" y2="11.336" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#CBB035"/>
                    <stop offset="1" stopColor="#A1700C"/>
                  </linearGradient>
                </defs>
              </svg>
              <span>Discord</span>
            </button>
            <div className="mb-10"></div>
          </div>
        </div>
      )}

      <div className="fixed bottom-0 left-0 right-0 bg-gray-800 p-4 flex justify-around">
        <Link to="/" className="flex flex-col items-center">
          <FontAwesomeIcon icon={faHome} className="text-yellow-500 text-2xl" />
          <span className="text-sm">Home</span>
        </Link>
        <button 
          onClick={() => setShowMenu(true)} 
          className="flex flex-col items-center"
        >
          <FontAwesomeIcon icon={faBars} className="text-gray-500 text-2xl" />
          <span className="text-sm">Menu</span>
        </button>
        <button 
          onClick={() => setShowCredits(true)} 
          className="flex flex-col items-center"
        >
          <FontAwesomeIcon icon={faCoins} className="text-gray-500 text-2xl" />
          <span className="text-sm">Credits</span>
        </button>
        <AdminPanel />
      </div>
    </div>
  );
};

export default Index;
