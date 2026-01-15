// ═══════════════════════════════════════════════════════════════════════
// OPENAI CONFIG
// ═══════════════════════════════════════════════════════════════════════

import OpenAI from 'openai';

const apiKey = import.meta.env.VITE_OPENAI_API_KEY || '';

export const isOpenAIConfigured = !!apiKey;

if (!isOpenAIConfigured) {
  console.warn('⚠️ OpenAI non configuré. Ajoutez VITE_OPENAI_API_KEY dans .env.local pour activer ASTRA');
}

export const openai = isOpenAIConfigured
  ? new OpenAI({
      apiKey,
      dangerouslyAllowBrowser: true,
    })
  : null;

export const ASTRA_MODEL = 'gpt-4-turbo-preview';
export const ASTRA_MAX_TOKENS = 500;
export const ASTRA_TEMPERATURE = 0.7;
