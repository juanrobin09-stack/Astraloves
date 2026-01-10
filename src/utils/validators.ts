// ═══════════════════════════════════════════════════════════════════════
// VALIDATORS
// ═══════════════════════════════════════════════════════════════════════

import { z } from 'zod';

export const emailSchema = z.string().email('Email invalide');

export const passwordSchema = z
  .string()
  .min(8, 'Le mot de passe doit contenir au moins 8 caractères')
  .regex(/[A-Z]/, 'Le mot de passe doit contenir au moins une majuscule')
  .regex(/[0-9]/, 'Le mot de passe doit contenir au moins un chiffre');

export const birthDateSchema = z
  .string()
  .refine((date) => {
    const d = new Date(date);
    const now = new Date();
    const age = now.getFullYear() - d.getFullYear();
    return age >= 18 && age <= 100;
  }, 'Tu dois avoir au moins 18 ans');

export const birthTimeSchema = z
  .string()
  .regex(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, 'Format HH:MM requis');

export const bioSchema = z
  .string()
  .max(500, 'La bio ne peut pas dépasser 500 caractères')
  .optional();

export const profileFormSchema = z.object({
  firstName: z.string().min(2, 'Le prénom doit contenir au moins 2 caractères'),
  birthDate: birthDateSchema,
  birthTime: birthTimeSchema,
  birthPlace: z.object({
    city: z.string().min(1, 'Ville requise'),
    lat: z.number(),
    lng: z.number(),
    timezone: z.string(),
  }),
  gender: z.enum(['man', 'woman', 'non-binary']),
  lookingFor: z.array(z.enum(['man', 'woman', 'non-binary'])).min(1, 'Choisis au moins une option'),
  bio: bioSchema,
});

export const messageSchema = z
  .string()
  .min(1, 'Le message ne peut pas être vide')
  .max(1000, 'Le message ne peut pas dépasser 1000 caractères');

export const validateUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

export const validateCoordinates = (lat: number, lng: number): boolean => {
  return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
};
