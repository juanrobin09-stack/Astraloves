import { useState, useEffect } from 'react';
import { AlertCircle, Star } from 'lucide-react';

export default function AgeGate() {
  const [showGate, setShowGate] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  useEffect(() => {
    const ageConfirmed = localStorage.getItem('age_confirmed');
    if (!ageConfirmed) {
      setShowGate(true);
    }
  }, []);

  const handleConfirm = () => {
    if (!confirmed) {
      return;
    }
    localStorage.setItem('age_confirmed', 'true');
    setShowGate(false);
  };

  if (!showGate) return null;

  return (
    <div className="fixed inset-0 bg-black z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 opacity-20">
        <div className="stars-bg absolute inset-0" />
      </div>

      <div className="relative z-10 max-w-md w-full">
        <div className="premium-card rounded-3xl p-10 text-center">
          <div className="flex justify-center mb-6">
            <Star className="w-20 h-20 text-red-600 premium-glow animate-pulse-glow" fill="white" />
          </div>

          <h1 className="text-4xl font-bold text-white mb-4 premium-text-sm">
            Astra est réservé aux +18 ans
          </h1>

          <div className="bg-red-600/10 border border-red-600/30 rounded-xl p-6 mb-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
              <div className="text-left">
                <p className="text-white font-semibold mb-2">
                  Service de divertissement pour adultes
                </p>
                <p className="text-gray-300 text-sm leading-relaxed">
                  Aucun conseil médical. Strictement réservé aux adultes.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-black/40 rounded-xl p-4 mb-6">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={confirmed}
                onChange={(e) => setConfirmed(e.target.checked)}
                className="w-5 h-5 mt-0.5 accent-red-600"
              />
              <span className="text-white text-left font-semibold">
                Je certifie avoir 18 ans ou plus et j'accepte d'accéder à ce service de divertissement pour adultes
              </span>
            </label>
          </div>

          <button
            onClick={handleConfirm}
            disabled={!confirmed}
            className="w-full premium-button text-white font-bold py-4 px-6 rounded-xl text-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Entrer
          </button>

          <p className="text-gray-500 text-xs mt-4">
            En continuant, vous confirmez être majeur selon la législation de votre pays
          </p>
        </div>
      </div>
    </div>
  );
}
