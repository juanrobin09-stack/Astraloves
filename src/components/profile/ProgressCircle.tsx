import { motion } from 'framer-motion';

export function ProgressCircle({ value }: { value: number }) {
  return (
    <div className="relative w-32 h-32 mx-auto">
      <svg className="w-full h-full transform -rotate-90">
        <circle cx="64" cy="64" r="56" className="fill-none stroke-white/10" strokeWidth="8" />
        <motion.circle
          cx="64" cy="64" r="56" className="fill-none stroke-cosmic-purple" strokeWidth="8"
          strokeDasharray={`${2 * Math.PI * 56}`}
          strokeDashoffset={2 * Math.PI * 56 * (1 - value / 100)}
          initial={{ strokeDashoffset: 2 * Math.PI * 56 }}
          animate={{ strokeDashoffset: 2 * Math.PI * 56 * (1 - value / 100) }}
          transition={{ duration: 1 }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-3xl font-bold">{value}%</span>
      </div>
    </div>
  );
}
