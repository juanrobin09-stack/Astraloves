export function SessionContextCard({ sessionType, tone }: any) {
  const getContextText = () => {
    if (sessionType === 'question') return 'Session : Questions libres';
    if (sessionType === 'guidance') return 'Session : Guidance relationnelle';
    if (sessionType === 'pattern') return 'Session : Analyse de patterns';
    if (sessionType === 'guardian') return 'Session : Guardian actif';
    return 'Session : Exploration cosmique';
  };

  return (
    <div className="sticky top-20 z-10 glass-effect px-4 py-2 rounded-medium text-center text-xs text-white/60">
      {getContextText()} • Ton : {tone}
    </div>
  );
}
