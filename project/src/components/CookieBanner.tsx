import { useState, useEffect } from 'react';
import { Cookie, X } from 'lucide-react';

export default function CookieBanner() {
  const [showBanner, setShowBanner] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookie_consent');
    if (!consent) {
      setShowBanner(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookie_consent', 'accepted');
    setShowBanner(false);
  };

  const handleRefuse = () => {
    localStorage.setItem('cookie_consent', 'refused');
    setShowBanner(false);
  };

  const handleSaveSettings = (analytics: boolean) => {
    localStorage.setItem('cookie_consent', analytics ? 'accepted' : 'refused');
    setShowBanner(false);
    setShowSettings(false);
  };

  if (!showBanner) return null;

  if (showSettings) {
    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100000] flex items-center justify-center p-4">
        <div className="premium-card rounded-2xl p-8 max-w-md w-full">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">Paramètres des cookies</h2>
            <button onClick={() => setShowSettings(false)} className="text-gray-400 hover:text-white">
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="space-y-4 mb-6">
            <div className="bg-black/40 rounded-xl p-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="text-white font-semibold">Cookies essentiels</h3>
                  <p className="text-gray-400 text-sm">Nécessaires au fonctionnement du site</p>
                </div>
                <span className="text-green-500 text-sm font-semibold">Toujours actifs</span>
              </div>
            </div>

            <div className="bg-black/40 rounded-xl p-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="text-white font-semibold">Cookies analytiques</h3>
                  <p className="text-gray-400 text-sm">Pour améliorer votre expérience</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" defaultChecked />
                  <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                </label>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => handleSaveSettings(false)}
              className="flex-1 bg-gray-800 hover:bg-gray-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
            >
              Refuser tout
            </button>
            <button
              onClick={() => handleSaveSettings(true)}
              className="flex-1 premium-button text-white font-semibold py-3 px-4 rounded-lg"
            >
              Accepter tout
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-black/95 backdrop-blur-lg border-t border-red-600/30 z-[100000] animate-slide-up">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
          <div className="flex items-start gap-3 flex-1">
            <Cookie className="w-8 h-8 text-red-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-white font-semibold text-lg mb-1">Nous utilisons des cookies</h3>
              <p className="text-gray-300 text-sm leading-relaxed">
                Nous utilisons des cookies pour améliorer ton expérience. Aucun cookie ne sera déposé avant ton acceptation.
              </p>
            </div>
          </div>

          <div className="flex gap-3 w-full md:w-auto">
            <button
              onClick={handleRefuse}
              className="flex-1 md:flex-none text-white font-semibold py-3 px-6 rounded-lg transition-colors"
              style={{ backgroundColor: '#E91E63' }}
            >
              Refuser
            </button>
            <button
              onClick={() => setShowSettings(true)}
              className="flex-1 md:flex-none text-white font-semibold py-3 px-6 rounded-lg transition-colors"
              style={{ backgroundColor: '#E91E63' }}
            >
              Paramètres
            </button>
            <button
              onClick={handleAccept}
              className="flex-1 md:flex-none text-white font-semibold py-3 px-6 rounded-lg transition-colors"
              style={{ backgroundColor: '#E91E63' }}
            >
              Accepter
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
