import { motion } from 'framer-motion';

export function TypingIndicator() {
  return (
    <div className="flex gap-3 items-start">
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cosmic-purple to-cosmic-blue flex items-center justify-center flex-shrink-0 text-sm">⭐</div>
      <div className="glass-effect px-4 py-3 rounded-r-large rounded-bl-large flex gap-1">
        {[0, 1, 2].map(i => (
          <motion.div
            key={i}
            className="w-2 h-2 rounded-full bg-white/60"
            animate={{ y: [-2, 2, -2] }}
            transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.2 }}
          />
        ))}
      </div>
    </div>
  );
}
