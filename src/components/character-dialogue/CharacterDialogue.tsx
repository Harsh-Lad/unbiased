"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { type AnalysisResult } from "@/lib/ai/ai-client";
import { CHARACTERS, type CharacterConfig } from "@/lib/characters";
import { CharacterAvatar } from "./CharacterAvatar";
import { SpeechBubble } from "./SpeechBubble";

interface CharacterDialogueProps {
  dialogue: AnalysisResult["characterDialogue"];
  onComplete?: () => void;
}

// ─── Typewriter Hook (smooth, no layout shift) ───
function useTypewriter(text: string, active: boolean, speed = 20) {
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!active) return;
    setDisplayed("");
    setDone(false);
    let i = 0;
    const interval = setInterval(() => {
      i++;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) {
        clearInterval(interval);
        setDone(true);
      }
    }, speed);
    return () => clearInterval(interval);
  }, [text, active, speed]);

  return { displayed, done };
}

// ─── Typing Dots Indicator ───
function TypingDots({ charConfig }: { charConfig: CharacterConfig }) {
  return (
    <motion.div
      className="flex items-center gap-1.5 px-4 py-3"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className={`w-2 h-2 rounded-full bg-gradient-to-br ${charConfig.gradient}`}
          animate={{
            y: [0, -6, 0],
            opacity: [0.4, 1, 0.4],
          }}
          transition={{
            duration: 0.8,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 0.15,
          }}
        />
      ))}
    </motion.div>
  );
}

// ─── Single Chat Message ───
function ChatMessage({
  line,
  charConfig,
  isTyping,
  onTypingDone,
}: {
  line: { character: string; message: string; emoji: string };
  charConfig: CharacterConfig;
  isTyping: boolean;
  onTypingDone: () => void;
}) {
  const isRight = charConfig.slideDirection === "right";
  const { displayed, done } = useTypewriter(line.message, isTyping, 18);
  const hasFired = useRef(false);

  useEffect(() => {
    if (done && !hasFired.current) {
      hasFired.current = true;
      onTypingDone();
    }
  }, [done, onTypingDone]);

  return (
    <motion.div
      className={`flex items-end gap-2.5 ${isRight ? "flex-row-reverse" : "flex-row"}`}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
      // Reserve minimum height to prevent layout shift
      style={{ minHeight: 52 }}
    >
      {/* Avatar */}
      <div className="shrink-0 mb-0.5">
        <CharacterAvatar character={charConfig} size={40} />
      </div>

      {/* Bubble */}
      <div className={`flex flex-col gap-1 ${isRight ? "items-end" : "items-start"} min-w-0 flex-1`}>
        {/* Name */}
        <span className={`text-xs font-semibold px-1 ${isRight ? "text-right" : ""}`}>
          <span className={`bg-gradient-to-r ${charConfig.gradient} bg-clip-text text-transparent`}>
            {line.character}
          </span>
          <span className="ml-1.5 text-muted-foreground/60">{line.emoji}</span>
        </span>

        {/* Message bubble */}
        <SpeechBubble bgColor={charConfig.bgColor} isRight={isRight}>
          <p className={`text-sm leading-relaxed text-foreground/90 ${isRight ? "text-right" : ""}`}>
            {isTyping ? displayed : line.message}
            {/* Blinking cursor */}
            {isTyping && !done && (
              <motion.span
                className="inline-block w-[2px] h-[13px] bg-foreground/50 ml-0.5 align-text-bottom rounded-full"
                animate={{ opacity: [1, 0] }}
                transition={{ duration: 0.5, repeat: Infinity, repeatType: "reverse" }}
              />
            )}
          </p>
        </SpeechBubble>
      </div>
    </motion.div>
  );
}

// ═══════════════════════════════════════
// ─── Main Character Dialogue Component ───
// ═══════════════════════════════════════

export function CharacterDialogue({ dialogue, onComplete }: CharacterDialogueProps) {
  // Index of the message currently being typed. -1 = not started.
  const [activeIndex, setActiveIndex] = useState(-1);
  // Set of indices whose typewriter has finished.
  const [completedIndices, setCompletedIndices] = useState<Set<number>>(new Set());
  // Whether we're showing the typing dots before the next message.
  const [showTypingDots, setShowTypingDots] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const stableOnComplete = useCallback(() => onComplete?.(), [onComplete]);

  // ─── Auto-scroll to bottom ───
  const scrollToBottom = useCallback(() => {
    if (scrollRef.current) {
      // Use requestAnimationFrame to ensure DOM has updated
      requestAnimationFrame(() => {
        scrollRef.current?.scrollTo({
          top: scrollRef.current.scrollHeight,
          behavior: "smooth",
        });
      });
    }
  }, []);

  // Scroll whenever new messages appear or typing begins
  useEffect(() => {
    scrollToBottom();
  }, [activeIndex, showTypingDots, completedIndices.size, scrollToBottom]);

  // ─── Kick off the first message ───
  useEffect(() => {
    if (!dialogue || dialogue.length === 0) return;
    if (activeIndex !== -1) return;

    const t = setTimeout(() => {
      setShowTypingDots(false);
      setActiveIndex(0);
    }, 1200); // Show typing dots first

    return () => clearTimeout(t);
  }, [dialogue, activeIndex]);

  // ─── When typewriter finishes a message ───
  const handleTypingDone = useCallback(
    (index: number) => {
      setCompletedIndices((prev) => new Set(prev).add(index));

      // If there are more messages, show typing dots then advance
      if (dialogue && index < dialogue.length - 1) {
        setShowTypingDots(true);
        const delay = 800 + Math.random() * 400; // Slight variation for naturalness
        const t = setTimeout(() => {
          setShowTypingDots(false);
          setActiveIndex(index + 1);
        }, delay);
        return () => clearTimeout(t);
      } else {
        // All messages done
        const t = setTimeout(() => stableOnComplete(), 600);
        return () => clearTimeout(t);
      }
    },
    [dialogue, stableOnComplete]
  );

  if (!dialogue || dialogue.length === 0) return null;

  // Messages to render: all completed + the currently typing one
  const visibleMessages = dialogue.slice(0, activeIndex + 1);

  // Character config for the typing dots (next character to speak)
  const nextCharConfig =
    activeIndex + 1 < dialogue.length
      ? CHARACTERS[dialogue[activeIndex + 1].character] || CHARACTERS["Curious Cat"]
      : null;

  // First character (for initial typing dots)
  const firstCharConfig =
    activeIndex === -1 && dialogue.length > 0
      ? CHARACTERS[dialogue[0].character] || CHARACTERS["Curious Cat"]
      : null;

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <motion.div
        className="flex items-center gap-3 pb-3 border-b border-border/40"
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        <div className="flex -space-x-2">
          {Object.values(CHARACTERS).map((char) => (
            <CharacterAvatar key={char.name} character={char} size={32} />
          ))}
        </div>
        <div>
          <h3 className="text-sm font-bold text-foreground">Detective Team Discussion</h3>
          <p className="text-xs text-muted-foreground">Analyzing your content together</p>
        </div>
      </motion.div>

      {/* Chat Container — fixed height, scrollable, no layout shift on content below */}
      <div
        ref={scrollRef}
        className="flex flex-col gap-4 py-4 px-1 overflow-y-auto scrollbar-thin scrollbar-thumb-black/10 dark:scrollbar-thumb-white/10 scrollbar-track-transparent rounded-xl bg-muted/20 dark:bg-white/[0.02] border border-border/30"
        style={{ height: 420, minHeight: 420 }}
      >
        {/* All visible messages */}
        {visibleMessages.map((line, idx) => {
          const charCfg = CHARACTERS[line.character] || CHARACTERS["Curious Cat"];
          const isCurrentlyTyping = idx === activeIndex && !completedIndices.has(idx);

          return (
            <div key={idx} className="px-3">
              <ChatMessage
                line={line}
                charConfig={charCfg}
                isTyping={isCurrentlyTyping}
                onTypingDone={() => handleTypingDone(idx)}
              />
            </div>
          );
        })}

        {/* Typing dots — shown between messages */}
        <AnimatePresence>
          {showTypingDots && (nextCharConfig || firstCharConfig) && (
            <motion.div
              key="typing-indicator"
              className="px-3"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4, transition: { duration: 0.15 } }}
            >
              <div
                className={`flex items-center gap-2.5 ${
                  (nextCharConfig || firstCharConfig)!.slideDirection === "right"
                    ? "flex-row-reverse"
                    : "flex-row"
                }`}
              >
                <div className="shrink-0">
                  <CharacterAvatar
                    character={(nextCharConfig || firstCharConfig)!}
                    size={36}
                  />
                </div>
                <div
                  className={`rounded-2xl ${
                    (nextCharConfig || firstCharConfig)!.bgColor
                  } ${
                    (nextCharConfig || firstCharConfig)!.slideDirection === "right"
                      ? "rounded-br-md"
                      : "rounded-bl-md"
                  }`}
                >
                  <TypingDots charConfig={(nextCharConfig || firstCharConfig)!} />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Message counter */}
      <motion.div
        className="flex items-center justify-between px-1 text-xs text-muted-foreground"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.4 }}
      >
        <span>
          {Math.min(completedIndices.size + (activeIndex >= 0 ? 1 : 0), dialogue.length)} of{" "}
          {dialogue.length} messages
        </span>
        <div className="flex items-center gap-1.5">
          <span
            className={`h-1.5 w-1.5 rounded-full ${
              completedIndices.size >= dialogue.length
                ? "bg-emerald-500"
                : "bg-amber-500 animate-pulse"
            }`}
          />
          <span>
            {completedIndices.size >= dialogue.length ? "Discussion complete" : "In progress..."}
          </span>
        </div>
      </motion.div>
    </div>
  );
}
