import React, { useState, useEffect } from 'react';
import { Heart, Gift, TrendingUp, Users, Leaf, Zap, X } from 'lucide-react';

interface ThankYouMessageProps {
  darkMode: boolean;
  userName: string;
  mealsCount: number;
  onClose?: () => void;
  autoClose?: boolean;
  autoCloseDuration?: number;
}

const ThankYouMessage: React.FC<ThankYouMessageProps> = ({
  darkMode,
  userName,
  mealsCount,
  onClose,
  autoClose = true,
  autoCloseDuration = 8000,
}) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (autoClose) {
      const timer = setTimeout(() => {
        handleClose();
      }, autoCloseDuration);

      return () => clearTimeout(timer);
    }
  }, [autoClose, autoCloseDuration]);

  const handleClose = () => {
    setIsVisible(false);
    onClose?.();
  };

  if (!isVisible) return null;

  // Calculate environmental impact
  const co2Saved = (mealsCount * 2.5).toFixed(2); // kg CO2
  const waterSaved = (mealsCount * 50).toFixed(0); // liters
  const foodWasteReducedKg = (mealsCount * 0.5).toFixed(1);

  return (
    <div className={`fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 animation-fadeIn`}>
      <style>{`
        @keyframes slideInUp {
          from {
            transform: translateY(20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        @keyframes bounce {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        .animation-slideInUp {
          animation: slideInUp 0.5s ease-out;
        }
        .animation-bounce {
          animation: bounce 1s ease-in-out 2;
        }
      `}</style>

      <div className={`max-w-2xl w-full rounded-2xl shadow-2xl overflow-hidden animation-slideInUp ${
        darkMode
          ? 'bg-gradient-to-br from-gray-800 via-gray-750 to-gray-800'
          : 'bg-gradient-to-br from-white via-blue-50 to-white'
      }`}>
        {/* Close Button */}
        <button
          onClick={handleClose}
          className={`absolute top-4 right-4 p-2 rounded-full transition z-10 ${
            darkMode
              ? 'hover:bg-gray-700 text-gray-400'
              : 'hover:bg-gray-100 text-gray-600'
          }`}
          aria-label="Close thank you message"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header with Heart Animation */}
        <div className={`p-8 text-center border-b ${
          darkMode
            ? 'bg-gradient-to-r from-red-900/30 to-purple-900/30 border-gray-700'
            : 'bg-gradient-to-r from-red-50 to-pink-50 border-red-200'
        }`}>
          <div className="animation-bounce mb-4 inline-block">
            <Heart className="w-12 h-12 text-red-500" />
          </div>
          <h1 className={`text-4xl font-bold mb-2 ${
            darkMode ? 'text-white' : 'text-gray-900'
          }`}>
            Thank You!
          </h1>
          <p className={`text-xl font-semibold ${
            darkMode ? 'text-red-300' : 'text-red-600'
          }`}>
            {userName}, Your Generosity Makes a Difference
          </p>
        </div>

        {/* Main Content */}
        <div className="p-8">
          {/* Primary Message */}
          <div className={`mb-8 p-6 rounded-xl border-2 ${
            darkMode
              ? 'bg-green-900/20 border-green-700/50'
              : 'bg-green-50 border-green-200'
          }`}>
            <p className={`text-lg font-semibold mb-2 flex items-center gap-2 ${
              darkMode ? 'text-green-300' : 'text-green-700'
            }`}>
              <Gift className="w-6 h-6" />
              Your Donation Impact
            </p>
            <p className={`text-base leading-relaxed ${
              darkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              You've just donated <span className="font-bold text-lg">{mealsCount} meals</span> that will directly feed families in need. 
              Your donation prevents food waste, reduces environmental impact, and brings hope to communities facing hunger.
            </p>
          </div>

          {/* Environmental Impact Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {/* CO2 Impact */}
            <div className={`p-4 rounded-lg text-center border ${
              darkMode
                ? 'bg-blue-900/20 border-blue-700/50'
                : 'bg-blue-50 border-blue-200'
            }`}>
              <div className={`flex justify-center mb-2 ${
                darkMode ? 'text-blue-300' : 'text-blue-600'
              }`}>
                <Leaf className="w-6 h-6" />
              </div>
              <p className={`text-sm font-medium mb-1 ${
                darkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>
                CO₂ Saved
              </p>
              <p className={`text-2xl font-bold ${
                darkMode ? 'text-blue-300' : 'text-blue-700'
              }`}>
                {co2Saved}kg
              </p>
              <p className={`text-xs mt-1 ${
                darkMode ? 'text-gray-500' : 'text-gray-500'
              }`}>
                Equivalent to planting trees
              </p>
            </div>

            {/* Water Saved */}
            <div className={`p-4 rounded-lg text-center border ${
              darkMode
                ? 'bg-cyan-900/20 border-cyan-700/50'
                : 'bg-cyan-50 border-cyan-200'
            }`}>
              <div className={`flex justify-center mb-2 ${
                darkMode ? 'text-cyan-300' : 'text-cyan-600'
              }`}>
                <Zap className="w-6 h-6" />
              </div>
              <p className={`text-sm font-medium mb-1 ${
                darkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>
                Water Saved
              </p>
              <p className={`text-2xl font-bold ${
                darkMode ? 'text-cyan-300' : 'text-cyan-700'
              }`}>
                {waterSaved}L
              </p>
              <p className={`text-xs mt-1 ${
                darkMode ? 'text-gray-500' : 'text-gray-500'
              }`}>
                Precious resource preserved
              </p>
            </div>

            {/* Food Waste Reduced */}
            <div className={`p-4 rounded-lg text-center border ${
              darkMode
                ? 'bg-green-900/20 border-green-700/50'
                : 'bg-green-50 border-green-200'
            }`}>
              <div className={`flex justify-center mb-2 ${
                darkMode ? 'text-green-300' : 'text-green-600'
              }`}>
                <TrendingUp className="w-6 h-6" />
              </div>
              <p className={`text-sm font-medium mb-1 ${
                darkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>
                Food Waste Reduced
              </p>
              <p className={`text-2xl font-bold ${
                darkMode ? 'text-green-300' : 'text-green-700'
              }`}>
                {foodWasteReducedKg}kg
              </p>
              <p className={`text-xs mt-1 ${
                darkMode ? 'text-gray-500' : 'text-gray-500'
              }`}>
                Landfill waste prevented
              </p>
            </div>
          </div>

          {/* Secondary Messages */}
          <div className="space-y-4 mb-8">
            {/* Waste Prevention */}
            <div className={`flex items-start gap-3 p-4 rounded-lg ${
              darkMode ? 'bg-gray-700' : 'bg-gray-100'
            }`}>
              <span className="text-2xl">♻️</span>
              <div>
                <p className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Food Waste Prevention
                </p>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Your donation prevents valuable food from going to landfills. This reduces methane emissions and environmental damage.
                </p>
              </div>
            </div>

            {/* Community Help */}
            <div className={`flex items-start gap-3 p-4 rounded-lg ${
              darkMode ? 'bg-gray-700' : 'bg-gray-100'
            }`}>
              <span className="text-2xl">👥</span>
              <div>
                <p className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Community Support
                </p>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {mealsCount} people in your community will receive nutritious food today thanks to your generosity.
                </p>
              </div>
            </div>

            {/* Food Safety */}
            <div className={`flex items-start gap-3 p-4 rounded-lg ${
              darkMode ? 'bg-gray-700' : 'bg-gray-100'
            }`}>
              <span className="text-2xl">✅</span>
              <div>
                <p className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Food Safety Ensured
                </p>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Your food has been verified for freshness and quality. Every donation meets our strict safety standards.
                </p>
              </div>
            </div>
          </div>

          {/* Call to Action */}
          <div className={`p-6 rounded-lg text-center border-2 ${
            darkMode
              ? 'bg-purple-900/20 border-purple-700/50'
              : 'bg-purple-50 border-purple-200'
          }`}>
            <p className={`text-lg font-bold mb-3 ${
              darkMode ? 'text-purple-300' : 'text-purple-700'
            }`}>
              🌟 Together We Make a Difference
            </p>
            <p className={`text-sm mb-4 ${
              darkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Share your impact and inspire others to donate. Every meal shared is a life touched.
            </p>
            <button
              onClick={() => alert('Sharing feature coming soon!')}
              className={`px-6 py-2 rounded-lg font-semibold transition ${
                darkMode
                  ? 'bg-purple-600 hover:bg-purple-700 text-white'
                  : 'bg-purple-600 hover:bg-purple-700 text-white'
              }`}
            >
              Share Your Impact 📤
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className={`p-6 text-center border-t ${
          darkMode
            ? 'bg-gray-750 border-gray-700'
            : 'bg-gray-50 border-gray-200'
        }`}>
          <p className={`text-sm ${
            darkMode ? 'text-gray-400' : 'text-gray-600'
          }`}>
            🙏 Thank you for being a Food Hero. Your donation will be received and verified within the next 2 hours.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ThankYouMessage;
