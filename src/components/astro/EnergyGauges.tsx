import { motion } from 'framer-motion';

export function EnergyGauges({ fire, earth, air, water }: { fire: number; earth: number; air: number; water: number }) {
  const energies = [
    { name: 'Feu', value: fire, color: 'red', icon: '🔥' },
    { name: 'Terre', value: earth, color: 'green', icon: '🌍' },
    { name: 'Air', value: air, color: 'blue', icon: '💨' },
    { name: 'Eau', value: water, color: 'purple', icon: '💧' },
  ];

  return (
    <div className="space-y-6">
      {energies.map(e => (
        <div key={e.name} className="glass-effect p-6 rounded-medium">
          <div className="flex justify-between items-center mb-3">
            <span className="font-semibold flex items-center gap-2"><span>{e.icon}</span>{e.name}</span>
            <span className="text-2xl font-bold">{e.value}%</span>
          </div>
          <div className="w-full bg-white/10 rounded-full h-3 overflow-hidden">
            <motion.div className={`h-full bg-cosmic-${e.color}`} initial={{ width: 0 }} animate={{ width: `${e.value}%` }} transition={{ duration: 1 }} />
          </div>
        </div>
      ))}
    </div>
  );
}
