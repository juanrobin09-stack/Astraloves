// ═══════════════════════════════════════════════════════════════════════
// OPENAI CONFIG
// ═══════════════════════════════════════════════════════════════════════

import OpenAI from 'openai';

const apiKey = import.meta.env.VITE_OPENAI_API_KEY;

if (!apiKey) {
  throw new Error('Missing OpenAI API key');
}

export const openai = new OpenAI({
  apiKey,
  dangerouslyAllowBrowser: true,
});

export const ASTRA_MODEL = 'gpt-4-turbo-preview';
export const ASTRA_MAX_TOKENS = 500;
export const ASTRA_TEMPERATURE = 0.7;
