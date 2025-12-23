interface AstraStarLogoProps {
  size?: number;
}

export default function AstraStarLogo({ size = 64 }: AstraStarLogoProps) {
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg viewBox="0 0 200 200" className="w-full h-full block">
        <defs>
          <linearGradient id="starGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{ stopColor: '#E94057', stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: '#dc2626', stopOpacity: 1 }} />
          </linearGradient>
        </defs>

        {[
          { cx: 100, cy: 50, r: 3 },
          { cx: 60, cy: 80, r: 2 },
          { cx: 140, cy: 80, r: 2 },
          { cx: 50, cy: 120, r: 2 },
          { cx: 150, cy: 120, r: 2 },
          { cx: 100, cy: 160, r: 3 },
          { cx: 75, cy: 100, r: 2 },
          { cx: 125, cy: 100, r: 2 },
        ].map((star, i) => (
          <g key={i}>
            <circle
              cx={star.cx}
              cy={star.cy}
              r={star.r}
              fill="url(#starGradient)"
              className="animate-pulse"
              style={{ animationDelay: `${i * 0.2}s` }}
            />
            <circle
              cx={star.cx}
              cy={star.cy}
              r={star.r * 2}
              fill="url(#starGradient)"
              opacity="0.2"
              className="animate-ping"
              style={{ animationDelay: `${i * 0.2}s` }}
            />
          </g>
        ))}

        <path
          d="M 100,50 L 60,80 L 50,120 L 100,160 L 150,120 L 140,80 Z"
          stroke="url(#starGradient)"
          strokeWidth="1"
          fill="none"
          opacity="0.5"
          className="animate-pulse"
        />
      </svg>
    </div>
  );
}
