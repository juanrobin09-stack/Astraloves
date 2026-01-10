export function UserChatBubble({ content, timestamp }: any) {
  return (
    <div className="flex gap-3 items-start justify-end">
      <div className="max-w-[70%] bg-white/10 px-4 py-3 rounded-l-large rounded-br-large"><p className="text-sm leading-relaxed">{content}</p></div>
    </div>
  );
}
