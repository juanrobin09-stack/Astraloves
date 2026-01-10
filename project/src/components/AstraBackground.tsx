import { useEffect, useState } from 'react';

interface Particle {
  id: number;
  emoji: string;
  left: number;
  delay: number;
  duration: number;
  drift: number;
  size: number;
  opacity: number;
}

export default function AstraBackground() {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    const emojis = ['♥', '✨', '💫'];
    const particleCount = window.innerWidth < 640 ? 10 : 15;

    const newParticles: Particle[] = Array.from({ length: particleCount }, (_, i) => ({
      id: i,
      emoji: emojis[Math.floor(Math.random() * emojis.length)],
      left: Math.random() * 100,
      delay: Math.random() * 10,
      duration: 20 + Math.random() * 20,
      drift: -20 + Math.random() * 40,
      size: 5 + Math.random() * 7,
      opacity: 0.2 + Math.random() * 0.2,
    }));

    setParticles(newParticles);
  }, []);

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      {/* Pattern de points rouges */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(233, 64, 87, 0.05) 1px, transparent 1px)',
          backgroundSize: '20px 20px'
        }}
      />

      {/* Gradient radial animé */}
      <div className="absolute inset-0 animate-gradient-shift">
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-1/2"
          style={{
            background: 'radial-gradient(circle at center top, rgba(233, 64, 87, 0.1) 0%, transparent 70%)'
          }}
        />
      </div>

      {/* Particules flottantes */}
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute animate-float-up"
          style={{
            left: `${particle.left}%`,
            bottom: '-50px',
            fontSize: `${particle.size}px`,
            opacity: particle.opacity,
            animationDelay: `${particle.delay}s`,
            animationDuration: `${particle.duration}s`,
            '--drift': `${particle.drift}px`,
          } as React.CSSProperties}
        >
          {particle.emoji}
        </div>
      ))}

      <style>{`
        @keyframes float-up {
          0% {
            transform: translateY(0) translateX(0) rotate(0deg);
          }
          50% {
            transform: translateY(-50vh) translateX(var(--drift, 0px)) rotate(180deg);
          }
          100% {
            transform: translateY(-100vh) translateX(0) rotate(360deg);
          }
        }

        @keyframes gradient-shift {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10%);
          }
        }

        .animate-float-up {
          animation: float-up linear infinite;
        }

        .animate-gradient-shift {
          animation: gradient-shift 15s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
