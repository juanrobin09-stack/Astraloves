// ═══════════════════════════════════════════════════════════════════════
// MEMORY SERVICE - Gestion mémoire ASTRA
// ═══════════════════════════════════════════════════════════════════════

import { supabase, handleSupabaseError } from '@/config/supabase';
import type { AstraMemory, MemoryType } from '@/types';

export const memoryService = {
  async createMemory(
    userId: string,
    type: MemoryType,
    content: string,
    importance: number = 5
  ): Promise<AstraMemory> {
    const { data, error } = await supabase
      .from('astra_memory')
      .insert({
        user_id: userId,
        memory_type: type,
        content,
        importance,
      })
      .select()
      .single();

    if (error) handleSupabaseError(error);
    return data as AstraMemory;
  },

  async getMemories(userId: string, limit?: number): Promise<AstraMemory[]> {
    let query = supabase
      .from('astra_memory')
      .select('*')
      .eq('user_id', userId)
      .order('importance', { ascending: false })
      .order('last_referenced', { ascending: false });

    if (limit) query = query.limit(limit);

    const { data, error } = await query;
    if (error) handleSupabaseError(error);
    return data as AstraMemory[];
  },

  async getTopMemories(userId: string, limit: number = 5): Promise<AstraMemory[]> {
    return this.getMemories(userId, limit);
  },

  async referenceMemory(memoryId: string) {
    const { error } = await supabase.rpc('increment_memory_reference', {
      memory_id: memoryId,
    });

    if (error) handleSupabaseError(error);
  },

  async deleteMemory(memoryId: string) {
    const { error } = await supabase
      .from('astra_memory')
      .delete()
      .eq('id', memoryId);

    if (error) handleSupabaseError(error);
  },

  async updateMemory(memoryId: string, updates: Partial<AstraMemory>) {
    const { data, error } = await supabase
      .from('astra_memory')
      .update(updates)
      .eq('id', memoryId)
      .select()
      .single();

    if (error) handleSupabaseError(error);
    return data as AstraMemory;
  },
};
