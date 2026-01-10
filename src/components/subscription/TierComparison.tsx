export function TierComparison() {
  return (
    <div className="max-w-6xl mx-auto px-6 py-16">
      <h3 className="text-2xl font-display font-bold text-center mb-12">Comparaison détaillée</h3>
      <div className="glass-effect rounded-large overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-white/5">
            <tr>
              <th className="text-left p-4">Feature</th>
              <th className="p-4">FREE</th>
              <th className="p-4 text-cosmic-purple">PREMIUM</th>
              <th className="p-4 text-cosmic-gold">ELITE</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            <tr><td className="p-4">Âmes visibles</td><td className="p-4 text-center">5</td><td className="p-4 text-center">20</td><td className="p-4 text-center">∞</td></tr>
            <tr><td className="p-4">Messages ASTRA/jour</td><td className="p-4 text-center">5</td><td className="p-4 text-center">40</td><td className="p-4 text-center">65</td></tr>
            <tr><td className="p-4">Guardian</td><td className="p-4 text-center">❌</td><td className="p-4 text-center">❌</td><td className="p-4 text-center">✅</td></tr>
            <tr><td className="p-4">Priorité algorithme</td><td className="p-4 text-center">1x</td><td className="p-4 text-center">1x</td><td className="p-4 text-center">3x</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
