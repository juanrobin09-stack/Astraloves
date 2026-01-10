export function AstraSpeaks({ userId }: { userId: string }) {
  return (
    <div className="glass-effect p-6 rounded-large border border-cosmic-purple/30">
      <h3 className="font-bold mb-2 flex items-center gap-2"><span className="text-xl">⭐</span>ASTRA te voit</h3>
      <p className="text-sm text-white/80 italic">"Tu cherches validation. Pas vérité."</p>
    </div>
  );
}
