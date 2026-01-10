export function AstraChatBubble({ content, timestamp }: any) {
  return (
    <div className="flex gap-3 items-start">
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cosmic-purple to-cosmic-blue flex items-center justify-center flex-shrink-0 text-sm">⭐</div>
      <div className="max-w-[70%] glass-effect px-4 py-3 rounded-r-large rounded-bl-large"><p className="text-sm leading-relaxed">{content}</p></div>
    </div>
  );
}
