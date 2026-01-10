interface MessageBubbleProps {
  message: string;
  timestamp: string;
  isUser?: boolean;
  userName?: string;
  showAvatar?: boolean;
}

export default function AstraMessageBubble({
  message,
  timestamp,
  isUser = false,
  userName = 'Vous',
  showAvatar = true
}: MessageBubbleProps) {
  if (isUser) {
    return (
      <div className="flex items-end justify-end gap-3 mb-4 animate-slide-in-right">
        <div className="flex flex-col items-end max-w-[85%] md:max-w-[70%]">
          <div className="px-[18px] py-[14px] rounded-[20px_20px_4px_20px] bg-[#2D3748] text-[#E5E7EB] leading-relaxed">
            {message}
          </div>
          <span className="text-xs text-gray-500 mt-1">{timestamp}</span>
        </div>
        {showAvatar && (
          <div className="w-10 h-10 rounded-full bg-gray-600 border-2 border-gray-400 flex items-center justify-center flex-shrink-0">
            <span className="text-sm font-semibold text-white">
              {userName.charAt(0).toUpperCase()}
            </span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-end gap-3 mb-4 animate-slide-in-left">
      {showAvatar && (
        <div className="w-[45px] h-[45px] rounded-full bg-gradient-to-br from-[#E94057] to-[#8A1538] border-2 border-[rgba(233,64,87,0.5)] flex items-center justify-center flex-shrink-0 shadow-[0_0_15px_rgba(233,64,87,0.4)]">
          <span className="text-2xl">⭐</span>
        </div>
      )}
      <div className="flex flex-col max-w-[85%] md:max-w-[70%]">
        <div
          className="px-5 py-4 rounded-[20px_20px_20px_4px] text-white leading-relaxed shadow-[0_4px_15px_rgba(233,64,87,0.3)]"
          style={{
            background: 'linear-gradient(135deg, #8A1538 0%, #E94057 100%)'
          }}
        >
          {message}
        </div>
        <span className="text-xs text-gray-500 mt-1">{timestamp}</span>
      </div>

      <style>{`
        @keyframes slide-in-left {
          from {
            opacity: 0;
            transform: translateX(-30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes slide-in-right {
          from {
            opacity: 0;
            transform: translateX(30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        .animate-slide-in-left {
          animation: slide-in-left 0.4s ease-out;
        }

        .animate-slide-in-right {
          animation: slide-in-right 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}

export function AstraTypingIndicator() {
  return (
    <div className="flex items-end gap-3 mb-4 animate-slide-in-left">
      <div className="w-[45px] h-[45px] rounded-full bg-gradient-to-br from-[#E94057] to-[#8A1538] border-2 border-[rgba(233,64,87,0.5)] flex items-center justify-center flex-shrink-0">
        <span className="text-2xl">⭐</span>
      </div>
      <div
        className="px-5 py-4 rounded-[20px_20px_20px_4px] shadow-[0_4px_15px_rgba(233,64,87,0.3)]"
        style={{
          background: 'linear-gradient(135deg, #8A1538 0%, #E94057 100%)'
        }}
      >
        <div className="flex gap-1.5">
          <div className="w-2 h-2 bg-[#E94057] rounded-full animate-pulse-dot" style={{ animationDelay: '0s' }} />
          <div className="w-2 h-2 bg-[#E94057] rounded-full animate-pulse-dot" style={{ animationDelay: '0.2s' }} />
          <div className="w-2 h-2 bg-[#E94057] rounded-full animate-pulse-dot" style={{ animationDelay: '0.4s' }} />
        </div>
      </div>

      <style>{`
        @keyframes pulse-dot {
          0%, 100% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(1.3);
            opacity: 0.7;
          }
        }

        @keyframes slide-in-left {
          from {
            opacity: 0;
            transform: translateX(-30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        .animate-pulse-dot {
          animation: pulse-dot 1.2s ease-in-out infinite;
        }

        .animate-slide-in-left {
          animation: slide-in-left 0.4s ease-out;
        }
      `}</style>
    </div>
  );
}
