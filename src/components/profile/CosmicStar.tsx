import { motion } from 'framer-motion';
import { ZODIAC_SYMBOLS } from '@/utils/constants';

export function CosmicStar({ sunSign, moonSign, tier }: any) {
  return (
    <motion.div
      className="relative w-40 h-40 rounded-full bg-gradient-to-br from-cosmic-purple via-cosmic-blue to-cosmic-pink flex items-center justify-center"
      animate={{ rotate: 360 }}
      transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
    >
      <div className="absolute inset-0 rounded-full border-2 border-white/20" />
      <div className="text-5xl">{ZODIAC_SYMBOLS[sunSign as keyof typeof ZODIAC_SYMBOLS]}</div>
      <div className="absolute bottom-2 right-2 text-2xl">{ZODIAC_SYMBOLS[moonSign as keyof typeof ZODIAC_SYMBOLS]}</div>
    </motion.div>
  );
}
