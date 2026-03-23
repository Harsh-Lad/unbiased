"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence, MotionConfig } from "framer-motion";
import { type AnalysisResult } from "@/lib/ai/ai-client";
import { CharacterDialogue } from "@/components/character-dialogue/CharacterDialogue";
import { AnalysisResults } from "@/components/analysis/AnalysisResults";
import { fadeSlideUp } from "@/lib/animation-variants";

interface AnalysisContainerProps {
  result: AnalysisResult;
}

export function AnalysisContainer({ result }: AnalysisContainerProps) {
  const [dialogueComplete, setDialogueComplete] = useState(false);
  const resultsRef = useRef<HTMLDivElement>(null);

  const hasDialogue = result.characterDialogue && result.characterDialogue.length > 0;

  const handleDialogueComplete = useCallback(() => {
    setDialogueComplete(true);
  }, []);

  // Scroll to results section when dialogue finishes
  useEffect(() => {
    if (dialogueComplete && resultsRef.current) {
      // Small delay so the results have time to render/animate in
      const t = setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 400);
      return () => clearTimeout(t);
    }
  }, [dialogueComplete]);

  return (
    <MotionConfig reducedMotion="user">
      <div className="flex flex-col gap-8">
        <CharacterDialogue
          dialogue={result.characterDialogue}
          onComplete={handleDialogueComplete}
        />

        <div ref={resultsRef}>
          <AnimatePresence>
            {(!hasDialogue || dialogueComplete) && (
              <motion.div
                key="analysis-results"
                variants={fadeSlideUp}
                initial={hasDialogue ? "hidden" : false}
                animate="visible"
              >
                <AnalysisResults result={result} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </MotionConfig>
  );
}
