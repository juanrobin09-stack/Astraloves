import { motion } from 'framer-motion';

export function AuraRing({ tier }: any) {
  const color = tier === 'free' ? 'white/20' : tier === 'premium' ? 'purple' : 'gold';
  return (
    <motion.div
      className={`absolute w-60 h-60 rounded-full border-2 border-cosmic-${color}`}
      animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.6, 0.3] }}
      transition={{ duration: 3, repeat: Infinity }}
    />
  );
}
