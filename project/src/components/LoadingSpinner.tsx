export default function LoadingSpinner() {
  return (
    <div className="min-h-screen velvet-bg relative overflow-hidden flex items-center justify-center">
      <div className="stars-bg absolute inset-0 opacity-30" />
      <div className="relative z-10 text-center">
        <div className="w-16 h-16 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4" />
        <div className="text-white text-2xl premium-text-sm">Chargement...</div>
      </div>
    </div>
  );
}
