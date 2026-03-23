import type { Variants } from "framer-motion";

// ═══════════════════════════════════════
// ─── Generic Reusable Variants ───
// ═══════════════════════════════════════

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 30, filter: "blur(4px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: {
      duration: 0.7,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  },
};

export const fadeIn: Variants = {
  hidden: { opacity: 0, filter: "blur(4px)" },
  visible: {
    opacity: 1,
    filter: "blur(0px)",
    transition: { duration: 0.6, ease: "easeOut" },
  },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.85 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      type: "spring",
      damping: 18,
      stiffness: 150,
      mass: 0.6,
    },
  },
};

export const staggerParent: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.1,
    },
  },
};

// ─── Hero Stagger (for landing page) ───

export const heroStagger: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2,
    },
  },
};

export const heroChild: Variants = {
  hidden: { opacity: 0, y: 40, filter: "blur(6px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: {
      duration: 0.8,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

// ═══════════════════════════════════════
// ─── Character Slide Entrances ───
// ═══════════════════════════════════════

export const slideFromLeft: Variants = {
  offscreen: { x: "-110%", opacity: 0 },
  enter: {
    x: 0,
    opacity: 1,
    transition: {
      type: "spring",
      damping: 24,
      stiffness: 80,
      mass: 0.8,
    },
  },
  exit: {
    x: "-110%",
    opacity: 0,
    transition: { duration: 0.45, ease: [0.4, 0, 0.2, 1] },
  },
};

export const slideFromRight: Variants = {
  offscreen: { x: "110%", opacity: 0 },
  enter: {
    x: 0,
    opacity: 1,
    transition: {
      type: "spring",
      damping: 24,
      stiffness: 80,
      mass: 0.8,
    },
  },
  exit: {
    x: "110%",
    opacity: 0,
    transition: { duration: 0.45, ease: [0.4, 0, 0.2, 1] },
  },
};

// ─── "Going to fetch evidence" action animation ───

export const fetchEvidenceLeft: Variants = {
  idle: { x: 0, scale: 1 },
  leave: {
    x: "-120%",
    scale: 0.8,
    rotate: -10,
    transition: { duration: 0.6, ease: [0.4, 0, 0.2, 1] },
  },
  returnWithEvidence: {
    x: 0,
    scale: 1,
    rotate: 0,
    transition: {
      type: "spring",
      damping: 15,
      stiffness: 100,
      mass: 0.8,
    },
  },
};

export const fetchEvidenceRight: Variants = {
  idle: { x: 0, scale: 1 },
  leave: {
    x: "120%",
    scale: 0.8,
    rotate: 10,
    transition: { duration: 0.6, ease: [0.4, 0, 0.2, 1] },
  },
  returnWithEvidence: {
    x: 0,
    scale: 1,
    rotate: 0,
    transition: {
      type: "spring",
      damping: 15,
      stiffness: 100,
      mass: 0.8,
    },
  },
};

// ═══════════════════════════════════════
// ─── Speech Bubble ───
// ═══════════════════════════════════════

export const speechBubblePop: Variants = {
  hidden: { opacity: 0, scale: 0.4, y: 20, rotate: -2 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    rotate: 0,
    transition: {
      type: "spring",
      damping: 12,
      stiffness: 220,
      mass: 0.45,
      delay: 0.12,
    },
  },
};

// ─── Evidence Card ───

export const evidenceCardPop: Variants = {
  hidden: { opacity: 0, scale: 0.5, y: 24, rotate: -4 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    rotate: 0,
    transition: {
      type: "spring",
      damping: 14,
      stiffness: 200,
      mass: 0.4,
    },
  },
};

// ─── Floating Emoji Reaction ───

export const floatingEmoji: Variants = {
  hidden: { opacity: 0, scale: 0, y: 20 },
  visible: {
    opacity: [0, 1, 1, 0.6, 0],
    scale: [0, 1.4, 1.1, 0.9, 0.6],
    y: [20, -8, -25, -40, -55],
    x: [0, 8, -4, 6, -2],
    rotate: [0, 10, -8, 5, 0],
    transition: {
      duration: 2.4,
      ease: "easeOut",
      times: [0, 0.15, 0.45, 0.75, 1],
    },
  },
};

// ─── Name Tag ───

export const namePop: Variants = {
  hidden: { opacity: 0, x: -14, scale: 0.75 },
  visible: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: {
      type: "spring",
      damping: 16,
      stiffness: 280,
      delay: 0.08,
    },
  },
};

// ═══════════════════════════════════════
// ─── Typing Indicator ───
// ═══════════════════════════════════════

export const typingDot = (index: number): Variants => ({
  idle: {
    opacity: [0.25, 1, 0.25],
    y: [0, -6, 0],
    scale: [0.8, 1.25, 0.8],
    transition: {
      duration: 1,
      ease: "easeInOut",
      repeat: Infinity,
      delay: index * 0.18,
    },
  },
});

export const typingBubbleEntrance: Variants = {
  hidden: { opacity: 0, scale: 0.6, y: 16 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: "spring",
      damping: 20,
      stiffness: 240,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.4,
    y: 8,
    transition: { duration: 0.2, ease: "easeIn" },
  },
};

// ─── "Walking" motion for avatar ───

export const walkingMotion = {
  y: [0, -5, 0, -5, 0],
  rotate: [0, -4, 0, 4, 0],
};

export const walkingTransition = {
  duration: 0.6,
  repeat: Infinity,
  ease: "easeInOut" as const,
};

// ═══════════════════════════════════════
// ─── Analysis Section Animations ───
// ═══════════════════════════════════════

export const fadeSlideUp: Variants = {
  hidden: { opacity: 0, y: 24, filter: "blur(4px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94], delay: 0.2 },
  },
};

export const analysisCardVariants: Variants = {
  hidden: { opacity: 0, y: 20, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.55,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  },
};

export const staggerContainer: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.15,
    },
  },
};

// ─── Page entrance for analysis pages ───

export const pageIconEntrance: Variants = {
  hidden: { opacity: 0, scale: 0.3, rotate: -20 },
  visible: {
    opacity: 1,
    scale: 1,
    rotate: -6,
    transition: {
      type: "spring",
      damping: 12,
      stiffness: 150,
      mass: 0.5,
    },
  },
};

export const pageTitleEntrance: Variants = {
  hidden: { opacity: 0, y: 30, filter: "blur(6px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: {
      duration: 0.7,
      ease: [0.22, 1, 0.36, 1],
      delay: 0.15,
    },
  },
};

export const pageSubtitleEntrance: Variants = {
  hidden: { opacity: 0, y: 20, filter: "blur(4px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: {
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1],
      delay: 0.3,
    },
  },
};

export const pageContentEntrance: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut",
      delay: 0.45,
    },
  },
};

// Legacy exports
export const avatarFloat: Variants = {
  idle: {
    y: [0, -6, 0],
    transition: { duration: 2, ease: "easeInOut", repeat: Infinity },
  },
};
