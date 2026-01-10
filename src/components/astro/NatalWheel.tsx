import type { NatalChartData } from '@/types';

interface NatalWheelProps {
  chart: NatalChartData;
}

export function NatalWheel({ chart }: NatalWheelProps) {
  return (
    <div className="glass-effect p-6 rounded-large">
      <h3 className="text-xl font-display font-bold mb-4">Roue Astrologique</h3>
      <div className="aspect-square rounded-full border-4 border-cosmic-purple/30 relative flex items-center justify-center">
        <div className="text-center">
          <p className="text-sm text-white/60 mb-2">Roue interactive</p>
          <p className="text-4xl">♈</p>
        </div>
      </div>
    </div>
  );
}
