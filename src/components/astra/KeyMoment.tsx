import { AlertCircle, Lightbulb, VolumeX, Brain } from 'lucide-react';

export function KeyMoment({ type, content }: any) {
  const config = {
    insight: { icon: AlertCircle, color: 'gold', label: 'Insight' },
    consciousness: { icon: Lightbulb, color: 'green', label: 'Prise de conscience' },
    silence: { icon: VolumeX, color: 'indigo', label: 'Silence recommandé' },
    memory: { icon: Brain, color: 'purple', label: 'Mémoire' },
  };

  const { icon: Icon, color, label } = config[type as keyof typeof config];

  return (
    <div className={`my-6 p-4 border-l-4 border-cosmic-${color} glass-effect rounded-r-medium`}>
      <div className="flex items-center gap-2 mb-2"><Icon className={`w-5 h-5 text-cosmic-${color}`} /><span className={`text-sm font-bold text-cosmic-${color}`}>{label}</span></div>
      <p className="text-sm text-white/80">{content}</p>
    </div>
  );
}
