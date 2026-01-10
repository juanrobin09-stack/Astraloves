import { motion } from 'framer-motion';
import { X, Sliders } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface FilterPanelProps {
  onClose: () => void;
}

export function FilterPanel({ onClose }: FilterPanelProps) {
  return (
    <motion.div
      className="absolute right-6 top-20 z-30 glass-effect p-6 rounded-large w-80"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
    >
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <Sliders className="w-5 h-5 text-cosmic-purple" />
          <h3 className="font-display font-bold">Filtres</h3>
        </div>
        <button
          onClick={onClose}
          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-4">
        {/* Distance */}
        <div>
          <label className="block text-sm font-medium mb-2">Distance maximale</label>
          <input
            type="range"
            min="10"
            max="200"
            defaultValue="50"
            className="w-full accent-cosmic-purple"
          />
          <div className="flex justify-between text-xs text-white/60 mt-1">
            <span>10 km</span>
            <span>200 km</span>
          </div>
        </div>

        {/* Age range */}
        <div>
          <label className="block text-sm font-medium mb-2">Tranche d'âge</label>
          <div className="flex gap-3">
            <input
              type="number"
              placeholder="Min"
              className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-medium text-sm"
            />
            <input
              type="number"
              placeholder="Max"
              className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-medium text-sm"
            />
          </div>
        </div>

        {/* Element preference */}
        <div>
          <label className="block text-sm font-medium mb-2">Élément dominant</label>
          <div className="grid grid-cols-2 gap-2">
            {['Feu 🔥', 'Terre 🌍', 'Air 💨', 'Eau 💧'].map(element => (
              <button
                key={element}
                className="px-3 py-2 text-sm bg-white/5 hover:bg-cosmic-purple/20 border border-white/10 rounded-medium transition-colors"
              >
                {element}
              </button>
            ))}
          </div>
        </div>

        {/* Compatibility min */}
        <div>
          <label className="block text-sm font-medium mb-2">Compatibilité minimale</label>
          <input
            type="range"
            min="0"
            max="100"
            defaultValue="50"
            className="w-full accent-cosmic-purple"
          />
          <p className="text-xs text-white/60 mt-1">Minimum 50%</p>
        </div>
      </div>

      <div className="mt-6 flex gap-3">
        <Button variant="secondary" size="sm" className="flex-1" onClick={onClose}>
          Réinitialiser
        </Button>
        <Button variant="primary" size="sm" className="flex-1" onClick={onClose}>
          Appliquer
        </Button>
      </div>
    </motion.div>
  );
}
