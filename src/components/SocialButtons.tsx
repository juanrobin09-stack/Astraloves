export default function SocialButtons() {
  return (
    <div className="space-y-3">
      <button
        type="button"
        disabled
        className="w-full py-3 px-4 rounded-xl bg-white/10 text-white border border-white/20 opacity-50 cursor-not-allowed"
      >
        Continuer avec Google (bientôt)
      </button>
      <button
        type="button"
        disabled
        className="w-full py-3 px-4 rounded-xl bg-white/10 text-white border border-white/20 opacity-50 cursor-not-allowed"
      >
        Continuer avec Facebook (bientôt)
      </button>
    </div>
  );
}
