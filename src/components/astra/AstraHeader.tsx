import { Menu, Star } from 'lucide-react';

export function AstraHeader({ quotaUsed, quotaLimit, tier }: any) {
  return (
    <div className="sticky top-0 z-20 glass-effect border-b border-white/10 px-4 py-3 flex justify-between items-center">
      <div className="flex items-center gap-3">
        <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/10"><Menu className="w-5 h-5" /></button>
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cosmic-purple to-cosmic-blue flex items-center justify-center"><Star className="w-5 h-5" /></div>
          <div><p className="font-bold">ASTRA</p><p className="text-xs text-cosmic-green">En ligne</p></div>
        </div>
      </div>
      <div className="px-3 py-1 glass-effect rounded-full text-xs"><span className={quotaUsed >= quotaLimit ? 'text-cosmic-red' : 'text-white/60'}>{quotaUsed}/{quotaLimit}</span></div>
    </div>
  );
}
