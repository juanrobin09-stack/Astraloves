// ═══════════════════════════════════════════════════════════════════════
// FRAMER MOTION ANIMATIONS
// ═══════════════════════════════════════════════════════════════════════

import type { Variants } from 'framer-motion';

export const fadeIn: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

export const fadeInUp: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

export const fadeInDown: Variants = {
  initial: { opacity: 0, y: -20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 20 },
};

export const scaleIn: Variants = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.95 },
};

export const slideInLeft: Variants = {
  initial: { opacity: 0, x: -50 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -50 },
};

export const slideInRight: Variants = {
  initial: { opacity: 0, x: 50 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 50 },
};

export const modalVariants: Variants = {
  initial: { opacity: 0, scale: 0.9, y: 20 },
  animate: { opacity: 1, scale: 1, y: 0 },
  exit: { opacity: 0, scale: 0.9, y: 20 },
};

export const staggerContainer: Variants = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

export const staggerItem: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

export const starTwinkle: Variants = {
  initial: { opacity: 0.5 },
  animate: {
    opacity: [0.5, 1, 0.5],
    transition: {
      duration: 2.5,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
};

export const cosmicPulse: Variants = {
  initial: { scale: 1, opacity: 0.8 },
  animate: {
    scale: [1, 1.08, 1],
    opacity: [0.8, 1, 0.8],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
};

export const DEFAULT_TRANSITION = {
  type: 'spring',
  stiffness: 300,
  damping: 30,
};

export const FAST_TRANSITION = {
  duration: 0.2,
  ease: 'easeOut',
};

export const MEDIUM_TRANSITION = {
  duration: 0.4,
  ease: 'easeInOut',
};

export const SLOW_TRANSITION = {
  duration: 0.6,
  ease: 'easeInOut',
};
