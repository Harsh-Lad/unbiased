export interface CharacterConfig {
  name: string;
  emoji: string;
  sprite: string;
  role: string;
  gradient: string;
  bgColor: string;
  borderColor: string;
  avatarBg: string;
  slideDirection: "left" | "right";
  /** Emojis that float near the character to express personality */
  reactionEmojis: string[];
  /** Action text shown when character goes to fetch evidence */
  fetchActionText: string;
}

export const CHARACTERS: Record<string, CharacterConfig> = {
  "Detective Dot": {
    name: "Detective Dot",
    emoji: "\u{1F50D}",
    sprite: "/sprites/detective-dot.svg",
    role: "Finds clues",
    gradient: "from-amber-500 to-orange-500",
    bgColor: "bg-amber-50/80 dark:bg-amber-950/20",
    borderColor: "border-amber-200 dark:border-amber-800/50",
    avatarBg: "bg-gradient-to-br from-amber-400 to-orange-500",
    slideDirection: "left",
    reactionEmojis: ["\u{1F9D0}", "\u{1F4A1}", "\u{1F50E}"],
    fetchActionText: "investigating the evidence...",
  },
  "Professor Owl": {
    name: "Professor Owl",
    emoji: "\u{1F989}",
    sprite: "/sprites/professor-owl.svg",
    role: "Explains concepts",
    gradient: "from-blue-500 to-indigo-500",
    bgColor: "bg-blue-50/80 dark:bg-blue-950/20",
    borderColor: "border-blue-200 dark:border-blue-800/50",
    avatarBg: "bg-gradient-to-br from-blue-400 to-indigo-500",
    slideDirection: "right",
    reactionEmojis: ["\u{1F4DA}", "\u{2705}", "\u{1F4DD}"],
    fetchActionText: "checking the research notes...",
  },
  "Curious Cat": {
    name: "Curious Cat",
    emoji: "\u{1F431}",
    sprite: "/sprites/curious-cat.svg",
    role: "Asks questions",
    gradient: "from-emerald-500 to-teal-500",
    bgColor: "bg-emerald-50/80 dark:bg-emerald-950/20",
    borderColor: "border-emerald-200 dark:border-emerald-800/50",
    avatarBg: "bg-gradient-to-br from-emerald-400 to-teal-500",
    slideDirection: "left",
    reactionEmojis: ["\u{1F914}", "\u{2753}", "\u{1F440}"],
    fetchActionText: "curious about something...",
  },
};
