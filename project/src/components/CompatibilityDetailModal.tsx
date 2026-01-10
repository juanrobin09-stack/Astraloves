import { X, Heart, Star, Sparkles, TrendingUp } from 'lucide-react';
import { CompatibilityScore, getCompatibilityLabel } from '../lib/compatibilityEngine';

interface CompatibilityDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  partnerName: string;
  score: CompatibilityScore;
}

export default function CompatibilityDetailModal({
  isOpen,
  onClose,
  partnerName,
  score,
}: CompatibilityDetailModalProps) {
  if (!isOpen) return null;

  const label = getCompatibilityLabel(score.overall);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-gradient-to-b from-gray-900 to-black rounded-2xl border-2 border-red-600/30 shadow-2xl">
        <button
          onClick={onClose}
          className="sticky top-4 float-right mr-4 w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors z-10"
        >
          <X className="w-6 h-6 text-white" />
        </button>

        <div className="p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-red-500 to-pink-600 mb-4">
              <Heart className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-2">
              Compatibilité avec {partnerName}
            </h2>
            <div className="flex items-center justify-center gap-2 mb-4">
              <span className={`text-6xl font-bold ${label.color}`}>
                {score.overall}%
              </span>
              <span className="text-2xl">{label.emoji}</span>
            </div>
            <p className={`text-xl font-semibold ${label.color}`}>
              {label.text}
            </p>
          </div>

          <div className="space-y-6">
            <div className="bg-black/40 rounded-xl p-6 border border-red-600/20">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-500" />
                Score Global
              </h3>
              <div className="relative w-full h-4 bg-gray-800 rounded-full overflow-hidden mb-2">
                <div
                  className="h-full bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 transition-all"
                  style={{ width: `${score.overall}%` }}
                />
              </div>
              <p className="text-gray-400 text-sm">
                Basé sur l'astrologie, les centres d'intérêt, la personnalité et la proximité géographique
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-black/40 rounded-xl p-4 border border-purple-500/20">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-4 h-4 text-purple-400" />
                  <h4 className="text-white font-semibold text-sm">Astrologie</h4>
                </div>
                <div className="relative w-full h-2 bg-gray-800 rounded-full overflow-hidden mb-2">
                  <div
                    className="h-full bg-gradient-to-r from-purple-500 to-purple-600"
                    style={{ width: `${score.astrological}%` }}
                  />
                </div>
                <p className="text-purple-400 font-bold text-lg">{score.astrological}%</p>
              </div>

              <div className="bg-black/40 rounded-xl p-4 border border-blue-500/20">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-4 h-4 text-blue-400" />
                  <h4 className="text-white font-semibold text-sm">Personnalité</h4>
                </div>
                <div className="relative w-full h-2 bg-gray-800 rounded-full overflow-hidden mb-2">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-blue-600"
                    style={{ width: `${score.personality}%` }}
                  />
                </div>
                <p className="text-blue-400 font-bold text-lg">{score.personality}%</p>
              </div>

              <div className="bg-black/40 rounded-xl p-4 border border-green-500/20">
                <div className="flex items-center gap-2 mb-2">
                  <Heart className="w-4 h-4 text-green-400" />
                  <h4 className="text-white font-semibold text-sm">Intérêts</h4>
                </div>
                <div className="relative w-full h-2 bg-gray-800 rounded-full overflow-hidden mb-2">
                  <div
                    className="h-full bg-gradient-to-r from-green-500 to-green-600"
                    style={{ width: `${score.interests}%` }}
                  />
                </div>
                <p className="text-green-400 font-bold text-lg">{score.interests}%</p>
              </div>

              <div className="bg-black/40 rounded-xl p-4 border border-yellow-500/20">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-yellow-400">📍</span>
                  <h4 className="text-white font-semibold text-sm">Proximité</h4>
                </div>
                <div className="relative w-full h-2 bg-gray-800 rounded-full overflow-hidden mb-2">
                  <div
                    className="h-full bg-gradient-to-r from-yellow-500 to-yellow-600"
                    style={{ width: `${score.distance}%` }}
                  />
                </div>
                <p className="text-yellow-400 font-bold text-lg">{score.distance}%</p>
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-xl p-6 border border-purple-500/30">
              <h3 className="text-xl font-bold text-white mb-4">Détails Astrologiques</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Signes solaires</span>
                  <span className="text-purple-400 font-bold">
                    {score.breakdown.sunSignCompatibility}%
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Éléments</span>
                  <span className="text-blue-400 font-bold">
                    {score.breakdown.elementCompatibility}%
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Modalités</span>
                  <span className="text-green-400 font-bold">
                    {score.breakdown.modalityCompatibility}%
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Aspects planétaires</span>
                  <span className="text-yellow-400 font-bold">
                    {score.breakdown.planetaryAspects}%
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-red-600/20 to-pink-600/20 rounded-xl p-6 border border-red-500/30">
              <h3 className="text-xl font-bold text-white mb-3">💡 Conseils Astra</h3>
              <ul className="space-y-2 text-gray-300">
                {score.overall >= 80 && (
                  <>
                    <li className="flex items-start gap-2">
                      <span className="text-green-500 mt-1">✓</span>
                      <span>Excellente compatibilité ! La communication sera naturelle.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-500 mt-1">✓</span>
                      <span>Vos énergies astrologiques s'harmonisent parfaitement.</span>
                    </li>
                  </>
                )}
                {score.overall >= 60 && score.overall < 80 && (
                  <>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-500 mt-1">✓</span>
                      <span>Bonne compatibilité avec quelques ajustements nécessaires.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-500 mt-1">✓</span>
                      <span>La patience et l'écoute renforceront votre lien.</span>
                    </li>
                  </>
                )}
                {score.overall < 60 && (
                  <>
                    <li className="flex items-start gap-2">
                      <span className="text-yellow-500 mt-1">!</span>
                      <span>Compatibilité modérée. La communication sera essentielle.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-yellow-500 mt-1">!</span>
                      <span>Vos différences peuvent être enrichissantes si bien gérées.</span>
                    </li>
                  </>
                )}
              </ul>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-full mt-6 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold py-4 px-8 rounded-xl transition-all"
          >
            Fermer
          </button>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
      `}</style>
    </div>
  );
}
