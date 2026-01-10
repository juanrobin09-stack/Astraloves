export function EnergySignature({ fire, earth, air, water }: any) {
  const dominant = Math.max(fire, earth, air, water);
  const dominantElement = fire === dominant ? 'Feu' : earth === dominant ? 'Terre' : air === dominant ? 'Air' : 'Eau';
  
  return (
    <div className="glass-effect p-6 rounded-large">
      <h3 className="font-bold mb-3">Signature Énergétique</h3>
      <p className="text-2xl mb-4">Dominant : {dominantElement}</p>
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div>🔥 Feu : {fire}%</div>
        <div>🌍 Terre : {earth}%</div>
        <div>💨 Air : {air}%</div>
        <div>💧 Eau : {water}%</div>
      </div>
    </div>
  );
}
