import { useState, useEffect } from 'react';
import { X, ArrowLeft } from 'lucide-react';
import { calculateAdvancedCompatibility, getCompatibilityDetails } from '../lib/advancedCompatibility';
import { formatDistance } from '../lib/frenchCitiesService';

interface UniverseTestPageProps {
  onNavigate?: (page: string) => void;
}

const currentUser = {
  id: 'me',
  prenom: 'Toi',
  age: 25,
  genre: 'homme',
  signe_astro: 'Lion',
  sun_sign: 'Lion',
  signe_emoji: '♌',
  ville: 'Paris',
  ville_data: {
    nom: 'Paris',
    coordinates: { lat: 48.8566, lng: 2.3522 },
  },
  recherche: {
    genre: 'femme',
    age_min: 20,
    age_max: 35,
  },
  questionnaire: {
    objectif: 'serieux',
    weekend: 'aventurier',
    lifestyle: 'equilibre',
    valeurs: 'loyal',
  },
  photo_profil: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face',
  abonnement: 'gratuit',
  signaux_restants: 10,
};

const testUsers = [
  {
    id: '1',
    prenom: 'Léa',
    age: 24,
    genre: 'femme',
    signe_astro: 'Bélier',
    sun_sign: 'Bélier',
    signe_emoji: '♈',
    ville: 'Paris',
    ville_data: { nom: 'Paris', coordinates: { lat: 48.8566, lng: 2.3522 } },
    questionnaire: { objectif: 'serieux', weekend: 'aventurier', lifestyle: 'equilibre', valeurs: 'loyal' },
    photo_profil: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&crop=face',
    recherche: { genre: 'homme', age_min: 23, age_max: 35 },
  },
  {
    id: '2',
    prenom: 'Emma',
    age: 26,
    genre: 'femme',
    signe_astro: 'Sagittaire',
    sun_sign: 'Sagittaire',
    signe_emoji: '♐',
    ville: 'Paris',
    ville_data: { nom: 'Paris', coordinates: { lat: 48.8606, lng: 2.3376 } },
    questionnaire: { objectif: 'amour', weekend: 'aventurier', lifestyle: 'equilibre', valeurs: 'humour' },
    photo_profil: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=200&h=200&fit=crop&crop=face',
    recherche: { genre: 'homme', age_min: 24, age_max: 32 },
  },
  {
    id: '3',
    prenom: 'Chloé',
    age: 23,
    genre: 'femme',
    signe_astro: 'Lion',
    sun_sign: 'Lion',
    signe_emoji: '♌',
    ville: 'Lyon',
    ville_data: { nom: 'Lyon', coordinates: { lat: 45.7640, lng: 4.8357 } },
    questionnaire: { objectif: 'serieux', weekend: 'culturel', lifestyle: 'equilibre', valeurs: 'loyal' },
    photo_profil: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop&crop=face',
    recherche: { genre: 'homme', age_min: 22, age_max: 30 },
  },
  {
    id: '4',
    prenom: 'Camille',
    age: 27,
    genre: 'femme',
    signe_astro: 'Bélier',
    sun_sign: 'Bélier',
    signe_emoji: '♈',
    ville: 'Paris',
    ville_data: { nom: 'Paris', coordinates: { lat: 48.8496, lng: 2.3472 } },
    questionnaire: { objectif: 'serieux', weekend: 'fetard', lifestyle: 'fetard', valeurs: 'humour' },
    photo_profil: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&h=200&fit=crop&crop=face',
    recherche: { genre: 'homme', age_min: 25, age_max: 35 },
  },
  {
    id: '5',
    prenom: 'Sarah',
    age: 25,
    genre: 'femme',
    signe_astro: 'Sagittaire',
    sun_sign: 'Sagittaire',
    signe_emoji: '♐',
    ville: 'Paris',
    ville_data: { nom: 'Paris', coordinates: { lat: 48.8626, lng: 2.3292 } },
    questionnaire: { objectif: 'amour', weekend: 'aventurier', lifestyle: 'flexible', valeurs: 'loyal' },
    photo_profil: 'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=200&h=200&fit=crop&crop=face',
    recherche: { genre: 'homme', age_min: 23, age_max: 32 },
  },
  {
    id: '6',
    prenom: 'Julie',
    age: 22,
    genre: 'femme',
    signe_astro: 'Gémeaux',
    sun_sign: 'Gémeaux',
    signe_emoji: '♊',
    ville: 'Bordeaux',
    ville_data: { nom: 'Bordeaux', coordinates: { lat: 44.8378, lng: -0.5792 } },
    questionnaire: { objectif: 'sais_pas', weekend: 'fetard', lifestyle: 'fetard', valeurs: 'independant' },
    photo_profil: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=200&h=200&fit=crop&crop=face',
    recherche: { genre: 'homme', age_min: 20, age_max: 30 },
  },
  {
    id: '7',
    prenom: 'Marine',
    age: 28,
    genre: 'femme',
    signe_astro: 'Vierge',
    sun_sign: 'Vierge',
    signe_emoji: '♍',
    ville: 'Paris',
    ville_data: { nom: 'Paris', coordinates: { lat: 48.8736, lng: 2.2950 } },
    questionnaire: { objectif: 'serieux', weekend: 'casanier', lifestyle: 'casanier', valeurs: 'loyal' },
    photo_profil: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop&crop=face',
    recherche: { genre: 'homme', age_min: 26, age_max: 38 },
  },
  {
    id: '8',
    prenom: 'Lucie',
    age: 24,
    genre: 'femme',
    signe_astro: 'Bélier',
    sun_sign: 'Bélier',
    signe_emoji: '♈',
    ville: 'Paris',
    ville_data: { nom: 'Paris', coordinates: { lat: 48.8456, lng: 2.3714 } },
    questionnaire: { objectif: 'amour', weekend: 'aventurier', lifestyle: 'equilibre', valeurs: 'ambitieux' },
    photo_profil: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&h=200&fit=crop&crop=face',
    recherche: { genre: 'homme', age_min: 22, age_max: 30 },
  },
  {
    id: '9',
    prenom: 'Manon',
    age: 26,
    genre: 'femme',
    signe_astro: 'Scorpion',
    sun_sign: 'Scorpion',
    signe_emoji: '♏',
    ville: 'Marseille',
    ville_data: { nom: 'Marseille', coordinates: { lat: 43.2965, lng: 5.3698 } },
    questionnaire: { objectif: 'aventure', weekend: 'fetard', lifestyle: 'fetard', valeurs: 'independant' },
    photo_profil: 'https://images.unsplash.com/photo-1502685104226-ee32379fefbe?w=200&h=200&fit=crop&crop=face',
    recherche: { genre: 'homme', age_min: 24, age_max: 35 },
  },
  {
    id: '10',
    prenom: 'Clara',
    age: 23,
    genre: 'femme',
    signe_astro: 'Sagittaire',
    sun_sign: 'Sagittaire',
    signe_emoji: '♐',
    ville: 'Paris',
    ville_data: { nom: 'Paris', coordinates: { lat: 48.8786, lng: 2.3522 } },
    questionnaire: { objectif: 'serieux', weekend: 'culturel', lifestyle: 'equilibre', valeurs: 'humour' },
    photo_profil: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=200&h=200&fit=crop&crop=face',
    recherche: { genre: 'homme', age_min: 21, age_max: 30 },
  },
  {
    id: '11',
    prenom: 'Alice',
    age: 25,
    genre: 'femme',
    signe_astro: 'Balance',
    sun_sign: 'Balance',
    signe_emoji: '♎',
    ville: 'Paris',
    ville_data: { nom: 'Paris', coordinates: { lat: 48.8566, lng: 2.3622 } },
    questionnaire: { objectif: 'amour', weekend: 'aventurier', lifestyle: 'flexible', valeurs: 'loyal' },
    photo_profil: 'https://images.unsplash.com/photo-1485875437342-9b39470b3d95?w=200&h=200&fit=crop&crop=face',
    recherche: { genre: 'homme', age_min: 23, age_max: 33 },
  },
  {
    id: '12',
    prenom: 'Inès',
    age: 24,
    genre: 'femme',
    signe_astro: 'Bélier',
    sun_sign: 'Bélier',
    signe_emoji: '♈',
    ville: 'Nantes',
    ville_data: { nom: 'Nantes', coordinates: { lat: 47.2184, lng: -1.5536 } },
    questionnaire: { objectif: 'serieux', weekend: 'aventurier', lifestyle: 'equilibre', valeurs: 'ambitieux' },
    photo_profil: 'https://images.unsplash.com/photo-1464863979621-258859e62245?w=200&h=200&fit=crop&crop=face',
    recherche: { genre: 'homme', age_min: 22, age_max: 32 },
  },
  {
    id: '13',
    prenom: 'Zoé',
    age: 22,
    genre: 'femme',
    signe_astro: 'Lion',
    sun_sign: 'Lion',
    signe_emoji: '♌',
    ville: 'Paris',
    ville_data: { nom: 'Paris', coordinates: { lat: 48.8656, lng: 2.3212 } },
    questionnaire: { objectif: 'sais_pas', weekend: 'culturel', lifestyle: 'flexible', valeurs: 'humour' },
    photo_profil: 'https://images.unsplash.com/photo-1519699047748-de8e457a634e?w=200&h=200&fit=crop&crop=face',
    recherche: { genre: 'homme', age_min: 20, age_max: 28 },
  },
  {
    id: '14',
    prenom: 'Jade',
    age: 27,
    genre: 'femme',
    signe_astro: 'Capricorne',
    sun_sign: 'Capricorne',
    signe_emoji: '♑',
    ville: 'Paris',
    ville_data: { nom: 'Paris', coordinates: { lat: 48.8476, lng: 2.3572 } },
    questionnaire: { objectif: 'serieux', weekend: 'casanier', lifestyle: 'casanier', valeurs: 'ambitieux' },
    photo_profil: 'https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=200&h=200&fit=crop&crop=face',
    recherche: { genre: 'homme', age_min: 25, age_max: 36 },
  },
  {
    id: '15',
    prenom: 'Nina',
    age: 25,
    genre: 'femme',
    signe_astro: 'Verseau',
    sun_sign: 'Verseau',
    signe_emoji: '♒',
    ville: 'Toulouse',
    ville_data: { nom: 'Toulouse', coordinates: { lat: 43.6047, lng: 1.4442 } },
    questionnaire: { objectif: 'aventure', weekend: 'fetard', lifestyle: 'fetard', valeurs: 'independant' },
    photo_profil: 'https://images.unsplash.com/photo-1496440737103-cd596325d314?w=200&h=200&fit=crop&crop=face',
    recherche: { genre: 'homme', age_min: 23, age_max: 32 },
  },
  {
    id: '16',
    prenom: 'Eva',
    age: 24,
    genre: 'femme',
    signe_astro: 'Bélier',
    sun_sign: 'Bélier',
    signe_emoji: '♈',
    ville: 'Paris',
    ville_data: { nom: 'Paris', coordinates: { lat: 48.8516, lng: 2.3422 } },
    questionnaire: { objectif: 'amour', weekend: 'aventurier', lifestyle: 'equilibre', valeurs: 'loyal' },
    photo_profil: 'https://images.unsplash.com/photo-1504703395950-b89145a5425b?w=200&h=200&fit=crop&crop=face',
    recherche: { genre: 'homme', age_min: 22, age_max: 32 },
  },
  {
    id: '17',
    prenom: 'Lola',
    age: 23,
    genre: 'femme',
    signe_astro: 'Sagittaire',
    sun_sign: 'Sagittaire',
    signe_emoji: '♐',
    ville: 'Paris',
    ville_data: { nom: 'Paris', coordinates: { lat: 48.8686, lng: 2.3322 } },
    questionnaire: { objectif: 'serieux', weekend: 'aventurier', lifestyle: 'flexible', valeurs: 'humour' },
    photo_profil: 'https://images.unsplash.com/photo-1492106087820-71f1a00d2b11?w=200&h=200&fit=crop&crop=face',
    recherche: { genre: 'homme', age_min: 21, age_max: 30 },
  },
  {
    id: '18',
    prenom: 'Rose',
    age: 26,
    genre: 'femme',
    signe_astro: 'Lion',
    sun_sign: 'Lion',
    signe_emoji: '♌',
    ville: 'Paris',
    ville_data: { nom: 'Paris', coordinates: { lat: 48.8396, lng: 2.3672 } },
    questionnaire: { objectif: 'amour', weekend: 'culturel', lifestyle: 'equilibre', valeurs: 'loyal' },
    photo_profil: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=200&h=200&fit=crop&crop=face',
    recherche: { genre: 'homme', age_min: 24, age_max: 34 },
  },
];

const getPlanetPosition = (index: number, total: number, radius = 140) => {
  const angle = (index / Math.min(total, 12)) * 2 * Math.PI - Math.PI / 2;
  const r = radius + (index % 3) * 30;
  return {
    x: Math.cos(angle) * r,
    y: Math.sin(angle) * r,
  };
};

export default function UniverseTestPage({ onNavigate }: UniverseTestPageProps) {
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [sortedUsers, setSortedUsers] = useState<any[]>([]);
  const plan = 'gratuit';
  const freeLimit = 15;

  useEffect(() => {
    const usersWithCompatibility = testUsers.map((user) => ({
      ...user,
      compatibilite: calculateAdvancedCompatibility(currentUser, user),
    }));

    const sorted = usersWithCompatibility.sort((a, b) => b.compatibilite - a.compatibilite);
    setSortedUsers(sorted);

    console.log('🎯 Top 5 compatibilités:', sorted.slice(0, 5).map(u => ({
      prenom: u.prenom,
      score: u.compatibilite
    })));
  }, []);

  const handlePlanetClick = (user: any, index: number) => {
    if (plan === 'gratuit' && index >= freeLimit) {
      alert('🔒 Passe Premium pour voir les 50 étoiles les plus compatibles');
      return;
    }
    setSelectedUser(user);
  };

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      <div className="starfield-universe" />

      <div className="fixed top-0 left-0 right-0 z-40 bg-black/90 backdrop-blur-md border-b border-red-600/20 p-4">
        <div className="flex items-center justify-between max-w-lg mx-auto">
          <div className="flex items-center gap-3">
            {onNavigate && (
              <button
                onClick={() => onNavigate('universe-map')}
                className="flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-purple-600/20 to-blue-600/20 border border-purple-500/30 rounded-lg text-white text-xs font-semibold hover:from-purple-600/30 hover:to-blue-600/30 transition-all"
              >
                <ArrowLeft className="w-3 h-3" />
                Retour
              </button>
            )}
            <span className="px-3 py-1 bg-gradient-to-r from-gray-800 to-gray-700 rounded-full text-white text-sm font-semibold">
              Mode Démo ✨
            </span>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <span className="text-white font-semibold">🔥 {currentUser.signaux_restants}/10</span>
            <span className="text-white font-semibold">⭐ {freeLimit}</span>
          </div>
        </div>
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center p-4 pt-20">
        <div className="relative w-full max-w-4xl aspect-square">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
            <div className="relative">
              <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-red-600 shadow-[0_0_30px_rgba(239,68,68,0.8)]">
                <img
                  src={currentUser.photo_profil}
                  alt="Toi"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-center whitespace-nowrap">
                <div className="text-white font-bold">{currentUser.prenom}</div>
                <div className="text-red-400 text-sm">{currentUser.signe_emoji}</div>
              </div>
            </div>
          </div>

          {sortedUsers.map((user, index) => {
            const position = getPlanetPosition(index, sortedUsers.length);
            const size =
              user.compatibilite >= 90 ? 65 :
              user.compatibilite >= 80 ? 55 :
              user.compatibilite >= 70 ? 48 : 40;
            const isBlurred = plan === 'gratuit' && index >= freeLimit;

            return (
              <div
                key={user.id}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-transform hover:scale-110"
                style={{
                  left: `calc(50% + ${position.x}px)`,
                  top: `calc(50% + ${position.y}px)`,
                  animation: `float ${3 + (index % 3)}s ease-in-out infinite`,
                  animationDelay: `${index * 0.1}s`,
                }}
                onClick={() => handlePlanetClick(user, index)}
              >
                <div
                  className={`rounded-full overflow-hidden border-2 border-red-500 ${
                    user.compatibilite >= 85
                      ? 'shadow-[0_0_25px_rgba(220,38,38,0.6)]'
                      : user.compatibilite >= 70
                      ? 'shadow-[0_0_15px_rgba(220,38,38,0.4)]'
                      : ''
                  }`}
                  style={{ width: size, height: size }}
                >
                  <img
                    src={user.photo_profil}
                    alt={user.prenom}
                    className="w-full h-full object-cover"
                    style={{ filter: isBlurred ? 'blur(8px)' : 'none' }}
                  />
                  {isBlurred && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                      <span className="text-2xl">🔒</span>
                    </div>
                  )}
                </div>

                {!isBlurred && (
                  <div className="absolute -bottom-9 left-1/2 -translate-x-1/2 bg-black/90 px-2 py-1 rounded-full text-xs text-white whitespace-nowrap flex items-center gap-1">
                    <span className="text-yellow-400">⭐</span>
                    <span className="font-bold">{user.compatibilite}%</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {selectedUser && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-end justify-center"
          onClick={() => setSelectedUser(null)}
        >
          <div
            className="bg-gradient-to-b from-gray-900 to-black rounded-t-3xl w-full max-w-lg p-6 border-t-2 border-red-600 animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedUser(null)}
              className="absolute top-4 right-4 p-2 bg-white/10 rounded-full hover:bg-white/20"
            >
              <X className="w-5 h-5 text-white" />
            </button>

            <div className="flex flex-col items-center gap-4">
              <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-red-600 shadow-[0_0_30px_rgba(239,68,68,0.6)]">
                <img
                  src={selectedUser.photo_profil}
                  alt={selectedUser.prenom}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="text-center">
                <h3 className="text-2xl font-bold text-white">
                  {selectedUser.prenom}, {selectedUser.age}
                </h3>
                <div className="text-red-400 text-lg mt-1">
                  {selectedUser.signe_emoji} {selectedUser.signe_astro}
                </div>
                <div className="text-gray-400 text-sm mt-1">
                  📍 {selectedUser.ville_data.nom}
                </div>
              </div>

              <div className="bg-gradient-to-r from-yellow-600/20 to-orange-600/20 border border-yellow-600/30 rounded-2xl px-6 py-3">
                <div className="text-center">
                  <div className="text-yellow-400 text-3xl font-bold">
                    ⭐ {selectedUser.compatibilite}%
                  </div>
                  <div className="text-white/60 text-sm mt-1">compatible</div>
                </div>
              </div>

              <div className="w-full grid grid-cols-3 gap-3 mt-2">
                <button className="py-3 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl text-white font-semibold hover:from-blue-700 hover:to-blue-800 transition-all">
                  Voir profil
                </button>
                <button className="py-3 bg-gradient-to-r from-purple-600 to-purple-700 rounded-xl text-white font-semibold hover:from-purple-700 hover:to-purple-800 transition-all">
                  💫 Signal
                </button>
                <button className="py-3 bg-gradient-to-r from-red-600 to-red-700 rounded-xl text-white font-semibold hover:from-red-700 hover:to-red-800 transition-all">
                  🌟 Super
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="fixed bottom-0 left-0 right-0 z-40 bg-black/90 backdrop-blur-md border-t border-white/10">
        <div className="max-w-lg mx-auto flex items-center justify-around py-4">
          <button className="flex flex-col items-center gap-1">
            <span className="text-2xl">🌌</span>
            <span className="text-xs font-medium text-red-500">Univers</span>
          </button>
          <button className="flex flex-col items-center gap-1">
            <span className="text-2xl opacity-50">💬</span>
            <span className="text-xs text-gray-500">Messages</span>
          </button>
          <button className="flex flex-col items-center gap-1">
            <span className="text-2xl opacity-50">✨</span>
            <span className="text-xs text-gray-500">Astra</span>
          </button>
          <button className="flex flex-col items-center gap-1">
            <span className="text-2xl opacity-50">🔮</span>
            <span className="text-xs text-gray-500">Astro</span>
          </button>
          <button className="flex flex-col items-center gap-1">
            <span className="text-2xl opacity-50">👤</span>
            <span className="text-xs text-gray-500">Profil</span>
          </button>
        </div>
      </div>

      <style>{`
        .starfield-universe {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: #000000;
          overflow: hidden;
        }

        .starfield-universe::before,
        .starfield-universe::after {
          content: '';
          position: absolute;
          width: 100%;
          height: 100%;
          background-image:
            radial-gradient(2px 2px at 20% 30%, white, transparent),
            radial-gradient(2px 2px at 60% 70%, white, transparent),
            radial-gradient(1px 1px at 50% 50%, white, transparent),
            radial-gradient(1px 1px at 80% 10%, white, transparent),
            radial-gradient(2px 2px at 90% 60%, white, transparent),
            radial-gradient(1px 1px at 33% 50%, white, transparent),
            radial-gradient(1px 1px at 66% 90%, white, transparent),
            radial-gradient(1px 1px at 15% 70%, white, transparent);
          background-size: 200px 200px;
          animation: stars 60s linear infinite;
        }

        .starfield-universe::after {
          background-image:
            radial-gradient(2px 2px at 40% 60%, white, transparent),
            radial-gradient(1px 1px at 70% 20%, white, transparent),
            radial-gradient(1px 1px at 30% 80%, white, transparent),
            radial-gradient(2px 2px at 85% 50%, white, transparent);
          background-size: 250px 250px;
          animation: stars 90s linear infinite;
        }

        @keyframes stars {
          from { transform: translateY(0); }
          to { transform: translateY(-200px); }
        }

        @keyframes float {
          0%, 100% { transform: translate(-50%, -50%) translateY(0px); }
          50% { transform: translate(-50%, -50%) translateY(-10px); }
        }

        @keyframes slide-up {
          from {
            transform: translateY(100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
