import { useState } from 'react';
import { Send, Mic } from 'lucide-react';

interface AstraInputAreaProps {
  onSend: (message: string) => void;
  disabled?: boolean;
  loading?: boolean;
}

const placeholders = [
  "Posez-moi une question sur la séduction... ✨",
  "Comment puis-je vous aider ? 💕",
  "Partagez vos préoccupations...",
  "Une question sur les relations ? 💫"
];

export default function AstraInputArea({ onSend, disabled = false, loading = false }: AstraInputAreaProps) {
  const [input, setInput] = useState('');
  const [placeholder] = useState(() => placeholders[Math.floor(Math.random() * placeholders.length)]);

  const handleSend = () => {
    if (input.trim() && !disabled && !loading) {
      onSend(input.trim());
      setInput('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const hasText = input.trim().length > 0;

  return (
    <div className="fixed bottom-0 left-0 right-0 h-20 bg-[#0F1419] backdrop-blur-xl border-t border-[rgba(233,64,87,0.2)] shadow-[0_-4px_20px_rgba(0,0,0,0.5)] z-40 px-4 flex items-center gap-3" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyPress={handleKeyPress}
        placeholder={placeholder}
        disabled={disabled || loading}
        className={`flex-1 h-[50px] bg-[#2D3748] border-2 rounded-[25px] px-5 text-white text-base placeholder:text-gray-400 outline-none transition-all duration-200 ${
          input ? 'bg-[#374151]' : ''
        }`}
        style={{
          borderColor: 'transparent'
        }}
        onFocus={(e) => {
          e.target.style.borderColor = '#E94057';
          e.target.style.boxShadow = '0 0 0 3px rgba(233, 64, 87, 0.2)';
        }}
        onBlur={(e) => {
          e.target.style.borderColor = 'transparent';
          e.target.style.boxShadow = 'none';
        }}
      />

      <button
        onClick={handleSend}
        disabled={!hasText || disabled || loading}
        className="w-[50px] h-[50px] rounded-full flex items-center justify-center transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
        style={{
          background: hasText && !disabled && !loading
            ? 'radial-gradient(circle, #E94057 0%, #8A1538 100%)'
            : 'rgba(75, 85, 99, 0.5)',
          boxShadow: hasText && !disabled && !loading ? '0 4px 15px rgba(233, 64, 87, 0.4)' : 'none'
        }}
        onMouseEnter={(e) => {
          if (hasText && !disabled && !loading) {
            e.currentTarget.style.transform = 'scale(1.1)';
            e.currentTarget.style.boxShadow = '0 6px 20px rgba(233, 64, 87, 0.6)';
          }
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
          if (hasText && !disabled && !loading) {
            e.currentTarget.style.boxShadow = '0 4px 15px rgba(233, 64, 87, 0.4)';
          }
        }}
      >
        {loading ? (
          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
        ) : hasText ? (
          <Send size={20} className="text-white" />
        ) : (
          <Mic size={20} className="text-gray-400" />
        )}
      </button>
    </div>
  );
}
