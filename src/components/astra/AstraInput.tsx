import { useState } from 'react';
import { Send } from 'lucide-react';

export function AstraInput({ onSend, quotaUsed, quotaLimit }: any) {
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (!input.trim() || quotaUsed >= quotaLimit) return;
    onSend(input.trim());
    setInput('');
  };

  const placeholders = [
    "Qu'est-ce qui te tracasse ?",
    "Parle. ASTRA écoute.",
    "Qu'as-tu observé ?",
    "Raconte ton pattern.",
  ];

  return (
    <div className="sticky bottom-0 glass-effect border-t border-white/10 p-4">
      <div className="flex gap-3 items-end max-w-4xl mx-auto">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
          placeholder={quotaUsed >= quotaLimit ? 'Quota atteint' : placeholders[Math.floor(Math.random() * placeholders.length)]}
          disabled={quotaUsed >= quotaLimit}
          className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-large resize-none focus:outline-none focus:border-cosmic-purple transition-colors"
          rows={1}
        />
        <button
          onClick={handleSend}
          disabled={!input.trim() || quotaUsed >= quotaLimit}
          className="w-12 h-12 rounded-full bg-cosmic-purple disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center hover:bg-cosmic-purple/90 transition-colors"
        >
          <Send className="w-5 h-5" />
        </button>
      </div>
      {quotaUsed >= quotaLimit && (
        <p className="text-xs text-cosmic-red text-center mt-2">Quota épuisé. Revenez demain ou passez {quotaLimit === 5 ? 'Premium' : 'Elite'}.</p>
      )}
    </div>
  );
}
