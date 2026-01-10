import { Shield, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export function GuardianBadge() {
  return (
    <motion.div
      className="glass-effect px-4 py-3 rounded-medium"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 0.5 }}
    >
      <div className="flex items-center gap-3">
        <div className="relative">
          <Shield className="w-6 h-6 text-cosmic-gold" />
          <motion.div
            className="absolute -inset-1 rounded-full border-2 border-cosmic-gold/30"
            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0, 0.3] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </div>
        
        <div>
          <p className="text-sm font-semibold text-cosmic-gold">Guardian Actif</p>
          <p className="text-xs text-white/60">Vous protège des patterns toxiques</p>
        </div>
      </div>
    </motion.div>
  );
}
