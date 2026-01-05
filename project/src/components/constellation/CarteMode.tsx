import { useEffect, useState } from 'react';
import { DatingProfile } from '../../data/datingProfiles';

interface CarteModeProps {
  profiles: DatingProfile[];
  onStarClick: (profile: DatingProfile) => void;
  currentUserId?: string;
}

interface StarPosition {
  profile: DatingProfile;
  x: number;
  y: number;
  angle: number;
  distance: number;
}

export default function CarteMode({ profiles, onStarClick, currentUserId }: CarteModeProps) {
  const [starPositions, setStarPositions] = useState<StarPosition[]>([]);
  const [hoveredStar, setHoveredStar] = useState<string | null>(null);

  useEffect(() => {
    const positions: StarPosition[] = profiles.map((profile, index) => {
      const angleStep = (2 * Math.PI) / profiles.length;
      const angle = angleStep * index;

      const compatibilityFactor = profile.compatibility / 100;
      const minDistance = 30;
      const maxDistance = 45;
      const distance = minDistance + (1 - compatibilityFactor) * (maxDistance - minDistance);

      const centerX = 50;
      const centerY = 50;
      const x = centerX + Math.cos(angle) * distance;
      const y = centerY + Math.sin(angle) * distance;

      return {
        profile,
        x: Math.max(10, Math.min(90, x)),
        y: Math.max(10, Math.min(90, y)),
        angle,
        distance
      };
    });

    setStarPositions(positions);
  }, [profiles]);

  if (profiles.length === 0) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="text-6xl mb-4">🌌</div>
          <p className="text-white/60 text-sm">L'univers est vide...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-[600px] bg-black rounded-2xl overflow-hidden border border-red-500/40 shadow-2xl">
      {/* Fond étoilé avec gradient radial */}
      <div className="absolute inset-0 bg-gradient-radial from-purple-950/50 via-black to-black">
        {/* Petites étoiles décoratives (background) */}
        {Array.from({ length: 100 }).map((_, i) => (
          <div
            key={`bg-star-${i}`}
            className="absolute rounded-full bg-white animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: `${1 + Math.random() * 2}px`,
              height: `${1 + Math.random() * 2}px`,
              opacity: Math.random() * 0.5 + 0.2,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 3}s`
            }}
          />
        ))}

        {/* Nebula effects */}
        <div
          className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full blur-3xl opacity-20"
          style={{
            background: 'radial-gradient(circle, rgba(236, 72, 153, 0.4) 0%, transparent 70%)'
          }}
        />
        <div
          className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full blur-3xl opacity-20"
          style={{
            background: 'radial-gradient(circle, rgba(168, 85, 247, 0.4) 0%, transparent 70%)'
          }}
        />
      </div>

      {/* TOI - Étoile centrale spectaculaire */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20">
        <div className="relative">
          {/* Anneaux pulsants multiples */}
          <div className="absolute inset-0 -z-10">
            <div
              className="absolute inset-0 rounded-full border-2 border-pink-400/40 animate-ping w-32 h-32 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
              style={{ animationDuration: '2s' }}
            />
            <div
              className="absolute inset-0 rounded-full border-2 border-purple-400/30 animate-ping w-40 h-40 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
              style={{ animationDuration: '2s', animationDelay: '0.5s' }}
            />
            <div
              className="absolute inset-0 rounded-full border-2 border-pink-300/20 animate-ping w-48 h-48 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
              style={{ animationDuration: '2s', animationDelay: '1s' }}
            />
          </div>

          {/* Aura principale massive */}
          <div
            className="absolute inset-0 rounded-full bg-gradient-radial from-pink-400/40 via-purple-500/20 to-transparent blur-2xl w-48 h-48 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse"
            style={{ animationDuration: '3s' }}
          />

          {/* L'étoile elle-même */}
          <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-pink-300 via-purple-400 to-pink-500
            shadow-[0_0_60px_rgba(236,72,153,0.9)] flex items-center justify-center
            border-4 border-white/20 animate-pulse-soft">
            <span className="text-5xl">👤</span>
          </div>

          {/* Particules qui orbitent */}
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1.5 h-1.5 bg-pink-300 rounded-full animate-orbit"
              style={{
                left: '50%',
                top: '50%',
                animationDelay: `${i * 0.3}s`,
                animationDuration: `${3 + i * 0.2}s`
              }}
            />
          ))}

          {/* Label avec fond stylé et glow */}
          <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 whitespace-nowrap">
            <div className="relative">
              {/* Glow derrière */}
              <div className="absolute inset-0 bg-pink-500/40 blur-xl rounded-full" />

              {/* Badge */}
              <div className="relative bg-gradient-to-r from-pink-600 to-purple-600 px-6 py-2
                rounded-full border-2 border-pink-300/50 shadow-lg min-w-max">
                <div className="flex items-center gap-2 whitespace-nowrap">
                  <span className="text-xl">🌟</span>
                  <span className="text-white font-bold text-base">MOI</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Étoiles utilisateurs (profils) avec auras */}
      {starPositions.map(({ profile, x, y }) => {
        const compatibility = profile.compatibility || 0;
        const isHovered = hoveredStar === profile.id;

        return (
          <button
            key={profile.id}
            onClick={() => onStarClick(profile)}
            onMouseEnter={() => setHoveredStar(profile.id)}
            onMouseLeave={() => setHoveredStar(null)}
            className="absolute transform -translate-x-1/2 -translate-y-1/2 transition-transform duration-300 hover:scale-125 z-10 group"
            style={{
              left: `${x}%`,
              top: `${y}%`,
              zIndex: isHovered ? 30 : 10
            }}
          >
            <div className="relative">
              {/* Aura pulsante si haute compatibilité */}
              {compatibility >= 85 && (
                <div
                  className="absolute inset-0 rounded-full blur-lg animate-pulse pointer-events-none"
                  style={{
                    background: compatibility >= 90
                      ? 'radial-gradient(circle, rgba(250,204,21,0.5) 0%, rgba(250,204,21,0) 70%)'
                      : 'radial-gradient(circle, rgba(244,114,182,0.5) 0%, rgba(244,114,182,0) 70%)',
                    width: '300%',
                    height: '300%',
                    left: '-100%',
                    top: '-100%',
                  }}
                />
              )}

              {/* L'étoile elle-même */}
              <div className={`relative rounded-full transition-all ${
                compatibility >= 90
                  ? 'w-10 h-10 bg-gradient-to-br from-yellow-300 via-yellow-400 to-orange-400 shadow-[0_0_25px_rgba(250,204,21,0.9)] animate-pulse'
                  : compatibility >= 75
                  ? 'w-8 h-8 bg-gradient-to-br from-pink-300 via-pink-400 to-pink-500 shadow-[0_0_20px_rgba(244,114,182,0.8)]'
                  : compatibility >= 60
                  ? 'w-6 h-6 bg-gradient-to-br from-blue-300 via-blue-400 to-blue-500 shadow-[0_0_15px_rgba(96,165,250,0.7)]'
                  : 'w-5 h-5 bg-slate-400 shadow-md'
              }`}>
                {/* Point central brillant */}
                <div className={`absolute inset-0 rounded-full ${
                  compatibility >= 85 ? 'bg-white/40' : ''
                }`} style={{
                  width: '40%',
                  height: '40%',
                  left: '30%',
                  top: '30%'
                }} />
              </div>

              {/* Rayons si très haute compatibilité (95%+) */}
              {compatibility >= 95 && (
                <div className="absolute inset-0">
                  {[...Array(8)].map((_, i) => (
                    <div
                      key={i}
                      className="absolute w-0.5 h-3 bg-gradient-to-t from-yellow-300 to-transparent"
                      style={{
                        left: '50%',
                        top: '50%',
                        transform: `rotate(${i * 45}deg) translateY(-15px)`,
                        transformOrigin: '0 15px',
                      }}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Tooltip au survol amélioré */}
            <div className={`absolute left-1/2 -translate-x-1/2 -top-12 transition-opacity pointer-events-none whitespace-nowrap z-20 ${
              isHovered ? 'opacity-100' : 'opacity-0'
            }`}>
              <div className="relative">
                {/* Glow */}
                <div className="absolute inset-0 bg-slate-900/60 blur-md rounded-lg" />

                {/* Contenu */}
                <div className="relative bg-slate-900/95 backdrop-blur-sm px-3 py-2 rounded-lg
                  border border-slate-700 shadow-xl">
                  <div className="text-white font-semibold text-sm">{profile.first_name}</div>
                  <div className="flex items-center gap-1.5 text-xs text-slate-300 mt-0.5">
                    <span className={
                      compatibility >= 90 ? 'text-yellow-400' :
                      compatibility >= 75 ? 'text-pink-400' :
                      'text-blue-400'
                    }>
                      {'⭐'.repeat(Math.floor(compatibility / 20))}
                    </span>
                    <span className="font-bold">{compatibility}%</span>
                    <span>·</span>
                    <span>{profile.zodiac}</span>
                  </div>
                </div>

                {/* Flèche */}
                <div className="absolute left-1/2 -translate-x-1/2 top-full w-2 h-2
                  bg-slate-900/95 rotate-45 -mt-1 border-r border-b border-slate-700" />
              </div>
            </div>

            {/* Activity indicator amélioré */}
            {profile.isOnline && (
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 border-2 border-black rounded-full animate-pulse
                shadow-[0_0_8px_rgba(74,222,128,0.8)]" />
            )}

            {/* Connecting line to center (subtle) */}
            {isHovered && (
              <svg
                className="absolute top-1/2 left-1/2 pointer-events-none opacity-20 transition-opacity"
                style={{
                  width: '200px',
                  height: '200px',
                  transform: 'translate(-50%, -50%)',
                  zIndex: -1
                }}
              >
                <line
                  x1="100"
                  y1="100"
                  x2={100 + (50 - x) * 2}
                  y2={100 + (50 - y) * 2}
                  stroke={compatibility >= 90 ? '#fbbf24' : compatibility >= 75 ? '#f472b6' : '#60a5fa'}
                  strokeWidth="2"
                  strokeDasharray="4,4"
                />
              </svg>
            )}
          </button>
        );
      })}

      {/* Legend améliorée */}
      <div className="absolute bottom-4 left-4 bg-black/90 backdrop-blur-sm px-4 py-3 rounded-xl border border-slate-700/50 shadow-xl z-40">
        <div className="text-white text-xs font-bold mb-2">Légende</div>
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-gradient-to-br from-yellow-300 to-orange-400 shadow-[0_0_8px_rgba(250,204,21,0.6)]" />
            <span className="text-white/80 text-xs">90%+ compatible ✨</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3.5 h-3.5 rounded-full bg-gradient-to-br from-pink-300 to-pink-500 shadow-[0_0_6px_rgba(244,114,182,0.6)]" />
            <span className="text-white/80 text-xs">75-89% compatible ⭐</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-gradient-to-br from-blue-300 to-blue-500 shadow-[0_0_4px_rgba(96,165,250,0.6)]" />
            <span className="text-white/80 text-xs">60-74% compatible 💫</span>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="absolute top-4 right-4 bg-black/90 backdrop-blur-sm px-4 py-3 rounded-xl border border-slate-700/50 shadow-xl z-40">
        <div className="text-center">
          <div className="text-2xl font-bold text-white mb-1">{profiles.length}</div>
          <div className="text-white/60 text-xs">étoiles visibles</div>
        </div>
      </div>

      {/* Instructions */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-black/90 backdrop-blur-sm px-4 py-2 rounded-full border border-slate-700/50 shadow-xl z-40">
        <p className="text-white/80 text-xs">
          ✨ Clique sur une étoile pour voir le profil
        </p>
      </div>
    </div>
  );
}
