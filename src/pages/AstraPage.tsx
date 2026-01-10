import { useState, useEffect, useRef } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useSubscriptionStore } from '@/store/subscriptionStore';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/config/supabase';
import { astraService } from '@/services/astra/astraService';
import { AstraHeader } from '@/components/astra/AstraHeader';
import { SessionContextCard } from '@/components/astra/SessionContextCard';
import { AstraChatBubble } from '@/components/astra/AstraChatBubble';
import { UserChatBubble } from '@/components/astra/UserChatBubble';
import { KeyMoment } from '@/components/astra/KeyMoment';
import { TypingIndicator } from '@/components/astra/TypingIndicator';
import { AstraInput } from '@/components/astra/AstraInput';
import { toast } from 'react-hot-toast';

export default function AstraPage() {
  const { profile } = useAuthStore();
  const { quota, tier } = useSubscriptionStore();
  const queryClient = useQueryClient();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isTyping, setIsTyping] = useState(false);

  const { data: conversation } = useQuery({
    queryKey: ['astra-conversation', profile?.id],
    queryFn: async () => {
      if (!profile) return null;
      const { data: conv } = await supabase
        .from('astra_conversations')
        .select('*')
        .eq('user_id', profile.id)
        .single();
      
      if (conv) return conv;

      const { data: newConv } = await supabase
        .from('astra_conversations')
        .insert({ user_id: profile.id, session_type: 'question', tone: 'observation' })
        .select()
        .single();
      
      return newConv;
    },
    enabled: !!profile,
  });

  const { data: messages } = useQuery({
    queryKey: ['astra-messages', conversation?.id],
    queryFn: async () => {
      if (!conversation) return [];
      const { data } = await supabase
        .from('astra_messages')
        .select('*')
        .eq('conversation_id', conversation.id)
        .order('created_at', { ascending: true });
      return data || [];
    },
    enabled: !!conversation,
  });

  const { data: memories } = useQuery({
    queryKey: ['astra-memory', profile?.id],
    queryFn: async () => {
      if (!profile) return [];
      return astraService.getMemories(profile.id);
    },
    enabled: !!profile,
  });

  const sendMessage = useMutation({
    mutationFn: async (content: string) => {
      if (!profile || !conversation) throw new Error('Not ready');

      if (quota && quota.astra_messages_used >= quota.astra_messages_limit) {
        throw new Error('Quota atteint');
      }

      await supabase.from('astra_messages').insert({
        conversation_id: conversation.id,
        message_type: 'user',
        content,
      });

      await supabase.from('quotas').update({
        astra_messages_used: (quota?.astra_messages_used || 0) + 1
      }).eq('id', quota?.id);

      setIsTyping(true);

      const response = await astraService.generateResponse(
        profile.id,
        content,
        profile,
        messages || [],
        memories || []
      );

      await supabase.from('astra_messages').insert({
        conversation_id: conversation.id,
        message_type: 'astra',
        content: response,
      });

      setIsTyping(false);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['astra-messages'] });
      queryClient.invalidateQueries({ queryKey: ['quota'] });
    },
    onError: (error: any) => {
      setIsTyping(false);
      toast.error(error.message);
    },
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  if (!profile || !conversation) {
    return <div className="h-full flex items-center justify-center"><div className="animate-cosmic-pulse text-2xl">⭐</div></div>;
  }

  const quotaUsed = quota?.astra_messages_used || 0;
  const quotaLimit = quota?.astra_messages_limit || (tier === 'free' ? 5 : tier === 'premium' ? 40 : 65);

  return (
    <div className="h-full flex flex-col bg-cosmic-black">
      <AstraHeader quotaUsed={quotaUsed} quotaLimit={quotaLimit} tier={tier} />
      
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
        <SessionContextCard sessionType={conversation.session_type} tone={conversation.tone} />

        {messages?.map((msg: any) => (
          <div key={msg.id}>
            {msg.message_type === 'user' && <UserChatBubble content={msg.content} timestamp={msg.created_at} />}
            {msg.message_type === 'astra' && <AstraChatBubble content={msg.content} timestamp={msg.created_at} />}
            {['insight', 'consciousness', 'silence', 'memory'].includes(msg.message_type) && (
              <KeyMoment type={msg.message_type} content={msg.content} />
            )}
          </div>
        ))}

        {isTyping && <TypingIndicator />}
        <div ref={messagesEndRef} />
      </div>

      <AstraInput onSend={(content) => sendMessage.mutate(content)} quotaUsed={quotaUsed} quotaLimit={quotaLimit} />
    </div>
  );
}
