import { ArrowLeft, Heart, Shield, TrendingUp, AlertCircle, Users, Star, Flame, Circle } from 'lucide-react';
import { AttachmentAnalysis, ArchetypeAnalysis, AstralAnalysis } from '../lib/questionnaireAnalysis';

interface ProfileLevel {
  level: 'Élevé' | 'Modéré' | 'Léger';
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  borderColor: string;
  description: string;
}

const getProfileLevel = (percentage: number): ProfileLevel => {
  if (percentage >= 70) {
    return {
      level: 'Élevé',
      icon: <Flame className="w-6 h-6" />,
      color: '#E63946',
      bgColor: 'rgba(230, 57, 70, 0.1)',
      borderColor: '#E63946',
      description: 'Intensité forte'
    };
  } else if (percentage >= 40) {
    return {
      level: 'Modéré',
      icon: <TrendingUp className="w-6 h-6" />,
      color: '#F77F00',
      bgColor: 'rgba(247, 127, 0, 0.1)',
      borderColor: '#F77F00',
      description: 'Équilibre naturel'
    };
  } else {
    return {
      level: 'Léger',
      icon: <Circle className="w-6 h-6" />,
      color: '#06B6D4',
      bgColor: 'rgba(6, 182, 212, 0.1)',
      borderColor: '#06B6D4',
      description: 'Approche douce'
    };
  }
};

interface QuestionnaireResultDetailProps {
  type: 'attachment' | 'archetype' | 'astral';
  analysis: AttachmentAnalysis | ArchetypeAnalysis | AstralAnalysis;
  onBack: () => void;
}

export default function QuestionnaireResultDetail({ type, analysis, onBack }: QuestionnaireResultDetailProps) {
  if (type === 'attachment') {
    const data = analysis as AttachmentAnalysis;
    return (
      <div className="h-screen flex flex-col bg-black text-white overflow-hidden">
        <div className="bg-gradient-to-br from-black via-gray-900/50 to-black backdrop-blur-sm border-b border-red-900/30 z-10 flex-shrink-0">
          <div className="flex items-center gap-3 p-4">
            <button
              onClick={onBack}
              className="p-2 hover:bg-gray-800 rounded-full transition"
            >
              <ArrowLeft size={24} />
            </button>
            <h1 className="text-2xl font-bold">Ton Style d'Attachement</h1>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6 pb-24" style={{
          scrollbarWidth: 'thin',
          scrollbarColor: '#ef4444 #1a1a1a'
        }}>
          {/* Type principal */}
          <div className="bg-gradient-to-br from-pink-900/30 to-red-900/30 border border-pink-500/30 rounded-2xl p-6 text-center">
            <div className="text-6xl mb-4">{data.emoji}</div>
            <h2 className="text-3xl font-bold mb-2">{data.title}</h2>
            {(() => {
              const profileLevel = getProfileLevel(data.percentage);
              return (
                <div
                  className="inline-flex flex-col items-center gap-2 px-6 py-3 rounded-2xl border-2"
                  style={{
                    backgroundColor: profileLevel.bgColor,
                    borderColor: profileLevel.borderColor,
                    boxShadow: `0 4px 16px ${profileLevel.bgColor}`,
                  }}
                >
                  <div style={{ color: profileLevel.color }}>
                    {profileLevel.icon}
                  </div>
                  <div className="text-xl font-black" style={{ color: profileLevel.color }}>
                    {profileLevel.level}
                  </div>
                </div>
              );
            })()}
          </div>

          {/* Description */}
          <div className="bg-gray-900 border border-red-900/20 rounded-xl p-6">
            <h3 className="text-xl font-bold mb-3 flex items-center gap-2">
              <Heart className="text-red-500" size={24} />
              Qui tu es
            </h3>
            <p className="text-gray-300 leading-relaxed">{data.description}</p>
          </div>

          {/* Forces */}
          <div className="bg-gray-900 border border-green-900/30 rounded-xl p-6">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-green-400">
              <TrendingUp size={24} />
              Tes Forces
            </h3>
            <ul className="space-y-2">
              {data.strengths.map((strength, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-green-400 mt-1">✓</span>
                  <span className="text-gray-300">{strength}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Défis */}
          <div className="bg-gray-900 border border-orange-900/30 rounded-xl p-6">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-orange-400">
              <AlertCircle size={24} />
              Tes Défis
            </h3>
            <ul className="space-y-2">
              {data.challenges.map((challenge, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-orange-400 mt-1">⚠</span>
                  <span className="text-gray-300">{challenge}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* En relation */}
          <div className="bg-gray-900 border border-purple-900/30 rounded-xl p-6">
            <h3 className="text-xl font-bold mb-3 flex items-center gap-2 text-purple-400">
              <Users size={24} />
              En Relation
            </h3>
            <p className="text-gray-300 leading-relaxed">{data.inRelationship}</p>
          </div>

          {/* Compatibilité */}
          <div className="bg-gray-900 border border-blue-900/30 rounded-xl p-6">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-blue-400">
              <Heart size={24} />
              Compatibilité
            </h3>
            <div className="space-y-4">
              <div>
                <p className="text-green-400 font-semibold mb-2">✓ Meilleure compatibilité :</p>
                <div className="flex flex-wrap gap-2">
                  {data.compatibility.best.map((type, i) => (
                    <span key={i} className="px-3 py-1 bg-green-900/30 border border-green-600/30 rounded-full text-sm text-green-300">
                      {type}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-orange-400 font-semibold mb-2">⚠ Relations difficiles :</p>
                <div className="flex flex-wrap gap-2">
                  {data.compatibility.challenging.map((type, i) => (
                    <span key={i} className="px-3 py-1 bg-orange-900/30 border border-orange-600/30 rounded-full text-sm text-orange-300">
                      {type}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Conseils */}
          <div className="bg-gradient-to-br from-yellow-900/20 to-orange-900/20 border border-yellow-600/30 rounded-xl p-6">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-yellow-400">
              <Shield size={24} />
              Conseils d'Astra
            </h3>
            <ul className="space-y-3">
              {data.advice.map((tip, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="text-yellow-400 mt-1 text-xl">★</span>
                  <span className="text-gray-200">{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    );
  }

  if (type === 'archetype') {
    const data = analysis as ArchetypeAnalysis;
    return (
      <div className="h-screen flex flex-col bg-black text-white overflow-hidden">
        <div className="bg-gradient-to-br from-black via-gray-900/50 to-black backdrop-blur-sm border-b border-red-900/30 z-10 flex-shrink-0">
          <div className="flex items-center gap-3 p-4">
            <button
              onClick={onBack}
              className="p-2 hover:bg-gray-800 rounded-full transition"
            >
              <ArrowLeft size={24} />
            </button>
            <h1 className="text-2xl font-bold">Ton Archétype</h1>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6 pb-24" style={{
          scrollbarWidth: 'thin',
          scrollbarColor: '#ef4444 #1a1a1a'
        }}>
          {/* Archétype principal */}
          <div className="bg-gradient-to-br from-purple-900/30 to-pink-900/30 border border-purple-500/30 rounded-2xl p-6 text-center">
            <div className="text-6xl mb-4">{data.emoji}</div>
            <h2 className="text-3xl font-bold mb-2">{data.primary}</h2>
            {data.secondary && (
              <p className="text-gray-400">Secondaire: {data.secondary}</p>
            )}
          </div>

          {/* Description */}
          <div className="bg-gray-900 border border-red-900/20 rounded-xl p-6">
            <h3 className="text-xl font-bold mb-3">Qui tu es</h3>
            <p className="text-gray-300 leading-relaxed">{data.description}</p>
          </div>

          {/* Caractéristiques */}
          <div className="bg-gray-900 border border-blue-900/30 rounded-xl p-6">
            <h3 className="text-xl font-bold mb-4 text-blue-400">Caractéristiques</h3>
            <div className="flex flex-wrap gap-2">
              {data.characteristics.map((char, i) => (
                <span key={i} className="px-4 py-2 bg-blue-900/30 border border-blue-600/30 rounded-full text-blue-300">
                  {char}
                </span>
              ))}
            </div>
          </div>

          {/* En amour */}
          <div className="bg-gray-900 border border-pink-900/30 rounded-xl p-6">
            <h3 className="text-xl font-bold mb-3 text-pink-400 flex items-center gap-2">
              <Heart size={24} />
              En Amour
            </h3>
            <p className="text-gray-300 leading-relaxed">{data.inLove}</p>
          </div>

          {/* Forces */}
          <div className="bg-gray-900 border border-green-900/30 rounded-xl p-6">
            <h3 className="text-xl font-bold mb-4 text-green-400">Forces</h3>
            <ul className="space-y-2">
              {data.strengths.map((strength, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-green-400">✓</span>
                  <span className="text-gray-300">{strength}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Faiblesses */}
          <div className="bg-gray-900 border border-orange-900/30 rounded-xl p-6">
            <h3 className="text-xl font-bold mb-4 text-orange-400">Zones d'attention</h3>
            <ul className="space-y-2">
              {data.weaknesses.map((weakness, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-orange-400">⚠</span>
                  <span className="text-gray-300">{weakness}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Carrières */}
          <div className="bg-gray-900 border border-indigo-900/30 rounded-xl p-6">
            <h3 className="text-xl font-bold mb-3 text-indigo-400">Carrières idéales</h3>
            <div className="flex flex-wrap gap-2">
              {data.careers.map((career, i) => (
                <span key={i} className="px-3 py-1 bg-indigo-900/30 border border-indigo-600/30 rounded-full text-sm text-indigo-300">
                  {career}
                </span>
              ))}
            </div>
          </div>

          {/* Personnalités célèbres */}
          <div className="bg-gradient-to-br from-yellow-900/20 to-orange-900/20 border border-yellow-600/30 rounded-xl p-6">
            <h3 className="text-xl font-bold mb-3 text-yellow-400 flex items-center gap-2">
              <Star size={24} />
              Personnalités similaires
            </h3>
            <div className="flex flex-wrap gap-2">
              {data.famous.map((person, i) => (
                <span key={i} className="px-3 py-2 bg-yellow-900/30 border border-yellow-600/30 rounded-full text-yellow-300">
                  {person}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Thème astral
  const data = analysis as AstralAnalysis;
  return (
    <div className="h-screen flex flex-col bg-black text-white overflow-hidden">
      <div className="bg-gradient-to-br from-black via-gray-900/50 to-black backdrop-blur-sm border-b border-red-900/30 z-10 flex-shrink-0">
        <div className="flex items-center gap-3 p-4">
          <button
            onClick={onBack}
            className="p-2 hover:bg-gray-800 rounded-full transition"
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-2xl font-bold">Ton Thème Astral</h1>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6 pb-24" style={{
        scrollbarWidth: 'thin',
        scrollbarColor: '#ef4444 #1a1a1a'
      }}>
        {/* Résumé */}
        <div className="bg-gradient-to-br from-indigo-900/30 to-purple-900/30 border border-indigo-500/30 rounded-2xl p-6">
          <h2 className="text-2xl font-bold mb-4 text-center">🌟 Ton Thème 🌟</h2>
          <p className="text-gray-300 text-center leading-relaxed">{data.summary}</p>
        </div>

        {/* Planètes principales */}
        <div className="space-y-4">
          <h3 className="text-xl font-bold">Planètes Personnelles</h3>

          <div className="bg-gray-900 border border-yellow-900/30 rounded-xl p-4">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-3xl">☀️</span>
              <div>
                <h4 className="font-bold text-yellow-400">Soleil en {data.sun.sign}</h4>
                <p className="text-sm text-gray-400">Maison {data.sun.house}</p>
              </div>
            </div>
            <p className="text-gray-300 text-sm">{data.sun.description}</p>
          </div>

          <div className="bg-gray-900 border border-blue-900/30 rounded-xl p-4">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-3xl">🌙</span>
              <div>
                <h4 className="font-bold text-blue-400">Lune en {data.moon.sign}</h4>
                <p className="text-sm text-gray-400">Maison {data.moon.house}</p>
              </div>
            </div>
            <p className="text-gray-300 text-sm">{data.moon.description}</p>
          </div>

          <div className="bg-gray-900 border border-red-900/30 rounded-xl p-4">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-3xl">⬆️</span>
              <div>
                <h4 className="font-bold text-red-400">Ascendant {data.rising.sign}</h4>
                <p className="text-sm text-gray-400">Ta première impression</p>
              </div>
            </div>
            <p className="text-gray-300 text-sm">{data.rising.description}</p>
          </div>

          <div className="bg-gray-900 border border-pink-900/30 rounded-xl p-4">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-3xl">♀️</span>
              <div>
                <h4 className="font-bold text-pink-400">Vénus en {data.venus.sign}</h4>
                <p className="text-sm text-gray-400">Maison {data.venus.house}</p>
              </div>
            </div>
            <p className="text-gray-300 text-sm">{data.venus.description}</p>
          </div>

          <div className="bg-gray-900 border border-orange-900/30 rounded-xl p-4">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-3xl">♂️</span>
              <div>
                <h4 className="font-bold text-orange-400">Mars en {data.mars.sign}</h4>
                <p className="text-sm text-gray-400">Maison {data.mars.house}</p>
              </div>
            </div>
            <p className="text-gray-300 text-sm">{data.mars.description}</p>
          </div>
        </div>

        {/* Éléments */}
        <div className="bg-gray-900 border border-red-900/20 rounded-xl p-6">
          <h3 className="text-xl font-bold mb-4">Répartition des Éléments</h3>
          <div className="space-y-3">
            {Object.entries(data.elements).map(([element, value]) => (
              <div key={element}>
                <div className="flex justify-between mb-1">
                  <span className="capitalize">{element === 'fire' ? '🔥 Feu' : element === 'earth' ? '🌍 Terre' : element === 'air' ? '💨 Air' : '💧 Eau'}</span>
                  <span className="font-bold">{value}%</span>
                </div>
                <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${
                      element === 'fire' ? 'bg-red-500' :
                      element === 'earth' ? 'bg-green-500' :
                      element === 'air' ? 'bg-blue-500' :
                      'bg-cyan-500'
                    }`}
                    style={{ width: `${value}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Dominantes */}
        <div className="bg-gradient-to-br from-purple-900/20 to-pink-900/20 border border-purple-600/30 rounded-xl p-6">
          <h3 className="text-xl font-bold mb-3 text-purple-400">Tes Dominantes</h3>
          <div className="flex flex-wrap gap-2">
            {data.dominant.map((dom, i) => (
              <span key={i} className="px-4 py-2 bg-purple-900/30 border border-purple-600/30 rounded-full text-purple-300 font-semibold">
                {dom}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
