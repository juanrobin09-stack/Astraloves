interface QuickReply {
  emoji: string;
  text: string;
  action: string;
}

interface AstraWelcomeMessageProps {
  onQuickReply: (action: string) => void;
}

const quickReplies: QuickReply[] = [
  { emoji: '💬', text: 'Améliorer mon opener', action: 'improve_opener' },
  { emoji: '❤️', text: 'Conseils de séduction', action: 'seduction_tips' },
  { emoji: '✨', text: 'Analyser un profil', action: 'analyze_profile' },
];

export default function AstraWelcomeMessage({ onQuickReply }: AstraWelcomeMessageProps) {
  return (
    <div className="flex items-start gap-3 mb-6 animate-fade-in">
      <div className="relative">
        <div className="absolute inset-0 w-16 h-16 -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2 bg-red-600/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="w-[45px] h-[45px] rounded-full bg-gradient-to-br from-[#E94057] to-[#8A1538] border-2 border-[rgba(233,64,87,0.5)] flex items-center justify-center flex-shrink-0 shadow-[0_0_15px_rgba(233,64,87,0.4)] animate-bounce-gentle relative">
          <span
            className="text-2xl"
            style={{
              filter: 'drop-shadow(0 0 30px rgba(220, 38, 38, 0.9)) drop-shadow(0 0 60px rgba(220, 38, 38, 0.6)) hue-rotate(-50deg) saturate(3) brightness(0.65)',
              color: '#DC2626'
            }}
          >⭐</span>
        </div>
      </div>

      <div className="flex flex-col max-w-[85%] md:max-w-[70%]">
        <div
          className="px-5 py-4 rounded-[20px_20px_20px_4px] text-white leading-relaxed shadow-[0_4px_15px_rgba(233,64,87,0.3)]"
          style={{
            background: 'linear-gradient(135deg, #8A1538 0%, #E94057 100%)'
          }}
        >
          <p className="mb-3">Bonjour ! 👋✨</p>
          <p className="mb-3">Je suis Astra, votre coach personnel en séduction et relations.</p>
          <p className="mb-3">Je suis là pour vous aider à :</p>
          <ul className="list-none space-y-1.5 mb-3 ml-2">
            <li>- Améliorer vos conversations 💬</li>
            <li>- Créer des profils attractifs ✨</li>
            <li>- Comprendre les signaux de séduction 💕</li>
            <li>- Booster votre confiance 🚀</li>
          </ul>
          <p>Comment puis-je vous aider aujourd'hui ?</p>
        </div>

        {/* Quick Replies */}
        <div className="flex flex-wrap gap-2 mt-3">
          {quickReplies.map((reply, index) => (
            <button
              key={reply.action}
              onClick={() => onQuickReply(reply.action)}
              className="px-4 py-2.5 rounded-[20px] bg-[rgba(233,64,87,0.15)] border border-[#E94057] text-white text-sm font-medium transition-all duration-200 hover:bg-[rgba(233,64,87,0.25)] hover:scale-105 active:scale-95 animate-scale-in"
              style={{
                animationDelay: `${index * 0.1}s`
              }}
            >
              <span className="mr-1.5">{reply.emoji}</span>
              {reply.text}
            </button>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes bounce-gentle {
          0%, 100% {
            transform: translateY(0) scale(1);
          }
          50% {
            transform: translateY(-5px) scale(1.05);
          }
        }

        @keyframes scale-in {
          from {
            opacity: 0;
            transform: scale(0.8);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }

        .animate-bounce-gentle {
          animation: bounce-gentle 2s ease-in-out infinite;
        }

        .animate-scale-in {
          animation: scale-in 0.3s ease-out forwards;
          opacity: 0;
        }
      `}</style>
    </div>
  );
}
