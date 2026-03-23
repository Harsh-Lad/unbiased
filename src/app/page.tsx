"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  heroStagger,
  heroChild,
  fadeUp,
  staggerParent,
  scaleIn,
} from "@/lib/animation-variants";

const features = [
  {
    icon: "🎬",
    title: "YouTube Analysis",
    description:
      "Paste a YouTube URL and analyze the video's transcript for bias, framing techniques, and missing perspectives.",
    href: "/youtube",
    gradient: "from-red-500 to-pink-500",
    bgGlow: "bg-red-500/10",
  },
  {
    icon: "📄",
    title: "PDF & Text Analysis",
    description:
      "Upload articles, essays, or PDFs to understand how language and framing may influence reader interpretation.",
    href: "/pdf",
    gradient: "from-blue-500 to-cyan-500",
    bgGlow: "bg-blue-500/10",
  },
  {
    icon: "🖼️",
    title: "Image Analysis",
    description:
      "Upload posters, ads, memes, or graphics to examine visual messaging, symbolism, and stereotypes.",
    href: "/image",
    gradient: "from-purple-500 to-violet-500",
    bgGlow: "bg-purple-500/10",
  },
];

const steps = [
  { num: "01", label: "Choose Content Type", desc: "YouTube, PDF/Text, or Image" },
  { num: "02", label: "Upload or Paste", desc: "Provide a URL, file, or text" },
  { num: "03", label: "AI Analysis", desc: "Our engine examines content" },
  { num: "04", label: "Learn & Explore", desc: "Understand how content shapes views" },
];

export default function LandingPage() {
  return (
    <div className="relative">
      {/* Background Pattern */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/80 via-white to-purple-50/80 dark:from-slate-950 dark:via-slate-950 dark:to-indigo-950/30" />
        <div className="absolute top-0 left-1/4 h-96 w-96 rounded-full bg-indigo-200/30 blur-3xl dark:bg-indigo-900/20 animate-float-slow" />
        <div className="absolute bottom-1/4 right-1/4 h-96 w-96 rounded-full bg-purple-200/30 blur-3xl dark:bg-purple-900/20 animate-float-slow" style={{ animationDelay: "4s" }} />
      </div>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8 lg:py-36">
          <motion.div
            className="text-center space-y-8"
            variants={heroStagger}
            initial="hidden"
            animate="visible"
          >
            {/* Badge */}
            <motion.div
              className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50/50 px-4 py-1.5 text-sm dark:border-indigo-800 dark:bg-indigo-950/50"
              variants={heroChild}
            >
              <span className="h-2 w-2 rounded-full bg-indigo-500 animate-pulse" />
              <span className="text-indigo-700 dark:text-indigo-300 font-medium">
                AI-Powered Educational Tool
              </span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              className="text-4xl sm:text-5xl lg:text-7xl font-bold tracking-tight"
              variants={heroChild}
            >
              <span className="block">Understand How</span>
              <span className="block bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent animate-gradient-shift">
                Content Shapes Thinking
              </span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              className="mx-auto max-w-2xl text-lg sm:text-xl text-muted-foreground leading-relaxed"
              variants={heroChild}
            >
              An educational platform that helps students understand how digital content
              may contain bias, stereotypes, or one-sided narratives.{" "}
              <span className="text-foreground font-medium">
                We don&apos;t judge — we explain.
              </span>
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
              variants={heroChild}
            >
              <Link
                href="/youtube"
                className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all duration-300 hover:shadow-xl hover:shadow-indigo-500/30 hover:from-indigo-600 hover:to-purple-700 hover:scale-105"
              >
                Start Analyzing
                <span className="text-lg transition-transform duration-300 group-hover:translate-x-1">→</span>
              </Link>
              <Link
                href="#features"
                className="group inline-flex items-center gap-2 rounded-xl border border-border bg-background/50 px-8 py-3.5 text-sm font-semibold transition-all duration-300 hover:bg-muted hover:scale-105"
              >
                Learn More
                <span className="text-lg transition-transform duration-300 group-hover:translate-y-0.5">↓</span>
              </Link>
            </motion.div>

            {/* Trust Banner */}
            <motion.div
              className="flex flex-wrap items-center justify-center gap-6 pt-8 text-sm text-muted-foreground"
              variants={heroChild}
            >
              {[
                "No data stored",
                "Fully stateless",
                "100% private",
                "Educational focus",
              ].map((item, i) => (
                <motion.span
                  key={item}
                  className="flex items-center gap-1.5"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.2 + i * 0.1, duration: 0.4, ease: "easeOut" }}
                >
                  <span className="text-emerald-500">✓</span> {item}
                </motion.span>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center space-y-4 mb-16"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={fadeUp}
          >
            <h2 className="text-3xl sm:text-4xl font-bold">
              Three Ways to{" "}
              <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Analyze Content
              </span>
            </h2>
            <p className="mx-auto max-w-xl text-muted-foreground">
              Choose the content type you want to understand. Our AI examines language,
              framing, and presentation techniques.
            </p>
          </motion.div>

          <motion.div
            className="grid gap-6 md:grid-cols-3"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            variants={staggerParent}
          >
            {features.map((feature) => (
              <motion.div key={feature.href} variants={scaleIn}>
                <Link
                  href={feature.href}
                  className="group relative overflow-hidden rounded-2xl border border-border/50 bg-background/50 backdrop-blur-sm p-8 transition-all duration-500 hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-500/10 hover:-translate-y-2 block"
                >
                  {/* Glow */}
                  <div
                    className={`absolute -top-20 -right-20 h-40 w-40 rounded-full ${feature.bgGlow} blur-3xl opacity-0 transition-opacity duration-500 group-hover:opacity-100`}
                  />

                  <div className="relative space-y-4">
                    <div
                      className={`inline-flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br ${feature.gradient} text-2xl shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:shadow-xl group-hover:rotate-3`}
                    >
                      {feature.icon}
                    </div>
                    <h3 className="text-xl font-bold">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {feature.description}
                    </p>
                    <div className="flex items-center gap-2 text-sm font-medium text-indigo-600 dark:text-indigo-400 transition-all duration-300 group-hover:gap-4">
                      Get started <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 sm:py-28 bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center space-y-4 mb-16"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={fadeUp}
          >
            <h2 className="text-3xl sm:text-4xl font-bold">How It Works</h2>
            <p className="mx-auto max-w-xl text-muted-foreground">
              A simple four-step process to understand content bias.
            </p>
          </motion.div>

          <motion.div
            className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            variants={staggerParent}
          >
            {steps.map((step) => (
              <motion.div
                key={step.num}
                className="text-center space-y-3 group"
                variants={fadeUp}
              >
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-xl font-bold shadow-lg shadow-indigo-500/25 transition-all duration-300 group-hover:scale-110 group-hover:shadow-xl group-hover:shadow-indigo-500/30 group-hover:-rotate-3">
                  {step.num}
                </div>
                <h3 className="font-bold text-lg">{step.label}</h3>
                <p className="text-sm text-muted-foreground">{step.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Characters Section */}
      <section className="py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center space-y-4 mb-16"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={fadeUp}
          >
            <h2 className="text-3xl sm:text-4xl font-bold">
              Meet Your{" "}
              <span className="bg-gradient-to-r from-amber-500 via-emerald-500 to-blue-500 bg-clip-text text-transparent">
                Guides
              </span>
            </h2>
            <p className="mx-auto max-w-xl text-muted-foreground">
              Three friendly characters help explain findings in a simple, relatable way.
            </p>
          </motion.div>

          <motion.div
            className="grid gap-6 md:grid-cols-3"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            variants={staggerParent}
          >
            {[
              {
                emoji: "🔍",
                name: "Detective Dot",
                role: "The Investigator",
                desc: "Finds hidden clues in the content — loaded language, missing facts, and subtle persuasion.",
                bg: "from-amber-400 to-orange-500",
                cardBg: "bg-amber-50 dark:bg-amber-950/20",
              },
              {
                emoji: "🦉",
                name: "Professor Owl",
                role: "The Educator",
                desc: "Explains media literacy concepts and teaches why certain techniques are used.",
                bg: "from-blue-400 to-indigo-500",
                cardBg: "bg-blue-50 dark:bg-blue-950/20",
              },
              {
                emoji: "🐱",
                name: "Curious Cat",
                role: "The Questioner",
                desc: "Asks the questions students might have — challenging assumptions and encouraging thought.",
                bg: "from-emerald-400 to-teal-500",
                cardBg: "bg-emerald-50 dark:bg-emerald-950/20",
              },
            ].map((char) => (
              <motion.div
                key={char.name}
                className={`text-center space-y-4 rounded-2xl p-8 ${char.cardBg} border border-border/50 transition-all duration-300 hover:-translate-y-2 hover:shadow-lg group`}
                variants={scaleIn}
              >
                <div
                  className={`mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br ${char.bg} text-4xl shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:rotate-6`}
                >
                  {char.emoji}
                </div>
                <h3 className="text-xl font-bold">{char.name}</h3>
                <p className="text-sm font-medium text-indigo-600 dark:text-indigo-400">
                  {char.role}
                </p>
                <p className="text-sm text-muted-foreground">{char.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-[10px] font-bold">
                UB
              </div>
              <span>Unbiased — Educational Bias Awareness Platform</span>
            </div>
            <p>No data is stored. All analysis is processed in memory.</p>
          </motion.div>
        </div>
      </footer>
    </div>
  );
}
