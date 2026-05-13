"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  heroStagger,
  heroChild,
  staggerParent,
  scaleIn,
  fadeUp,
} from "@/lib/animation-variants";

const features = [
  {
    icon: "🎬",
    title: "YouTube",
    description: "Paste a link and uncover bias, framing tricks, and missing perspectives hidden in video transcripts!",
    href: "/youtube",
    gradient: "from-red-500 to-pink-500",
    bg: "bg-red-100 dark:bg-red-900/30",
    borderHover: "hover:border-red-500",
  },
  {
    icon: "📄",
    title: "PDF & Text",
    description: "Upload articles or paste text to see how language and framing sneakily shape what you think!",
    href: "/pdf",
    gradient: "from-blue-500 to-cyan-500",
    bg: "bg-blue-100 dark:bg-blue-900/30",
    borderHover: "hover:border-blue-500",
  },
  {
    icon: "🖼️",
    title: "Image",
    description: "Drop in posters, ads, or memes and discover hidden visual messaging and stereotypes!",
    href: "/image",
    gradient: "from-purple-500 to-violet-500",
    bg: "bg-purple-100 dark:bg-purple-900/30",
    borderHover: "hover:border-purple-500",
  },
];

const steps = [
  { num: "01", label: "Pick Your Content", desc: "YouTube, PDF, or Image", icon: "🎯" },
  { num: "02", label: "Upload or Paste", desc: "Drop a URL, file, or text", icon: "📎" },
  { num: "03", label: "AI Investigation", desc: "Our detectives get to work!", icon: "🔍" },
  { num: "04", label: "Learn & Explore", desc: "See how content shapes views", icon: "💡" },
];

const characters = [
  {
    emoji: "🔍",
    name: "Detective Dot",
    role: "The Investigator",
    desc: "Finds hidden clues — loaded language, missing facts, and sneaky persuasion tricks!",
    gradient: "from-amber-400 to-orange-500",
    bg: "bg-amber-100 dark:bg-amber-900/30",
  },
  {
    emoji: "🦉",
    name: "Professor Owl",
    role: "The Educator",
    desc: "Explains media literacy concepts and teaches why certain techniques are used!",
    gradient: "from-blue-400 to-indigo-500",
    bg: "bg-blue-100 dark:bg-blue-900/30",
  },
  {
    emoji: "🐱",
    name: "Curious Cat",
    role: "The Questioner",
    desc: "Asks the questions YOU might have — challenging assumptions and sparking thought!",
    gradient: "from-emerald-400 to-teal-500",
    bg: "bg-emerald-100 dark:bg-emerald-900/30",
  },
];

export default function LandingPage() {
  return (
    <div className="relative min-h-screen bg-yellow-50 dark:bg-slate-900 font-sans overflow-hidden">
      {/* Comic dots pattern overlay */}
      <div
        className="fixed inset-0 z-0 opacity-[0.04] dark:opacity-[0.06] mix-blend-multiply dark:mix-blend-screen pointer-events-none"
        style={{ backgroundImage: "radial-gradient(circle, #000 2px, transparent 2px)", backgroundSize: "24px 24px" }}
      />

      {/* Hero Section */}
      <section className="relative z-10 overflow-hidden">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8 lg:py-32">
          <motion.div
            className="text-center space-y-8"
            variants={heroStagger}
            initial="hidden"
            animate="visible"
          >
            {/* Badge */}
            <motion.div
              className="inline-flex items-center gap-2 rounded-full border-3 border-black dark:border-white bg-white dark:bg-slate-800 px-5 py-2 shadow-[3px_3px_0px_rgba(0,0,0,1)] dark:shadow-[3px_3px_0px_rgba(255,255,255,1)]"
              variants={heroChild}
            >
              <span className="h-3 w-3 rounded-full bg-green-500 animate-pulse" />
              <span className="text-sm font-black uppercase tracking-wider text-black dark:text-white">
                AI-Powered Detective Agency
              </span>
              <span className="text-lg">🕵️</span>
            </motion.div>

            {/* Headline */}
            <motion.div variants={heroChild} className="space-y-2">
              <h1
                className="text-5xl sm:text-6xl lg:text-8xl font-black uppercase tracking-tighter text-white dark:text-slate-900"
                style={{ WebkitTextStroke: "3px black", textShadow: "8px 8px 0px rgba(0,0,0,1)" }}
              >
                Uncover The
              </h1>
              <h1
                className="text-5xl sm:text-6xl lg:text-8xl font-black uppercase tracking-tighter bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent"
                style={{ WebkitTextStroke: "0px", textShadow: "none", filter: "drop-shadow(6px 6px 0px rgba(0,0,0,0.3))" }}
              >
                Hidden Truth!
              </h1>
            </motion.div>

            {/* Subtitle */}
            <motion.p
              className="text-lg md:text-xl font-bold text-black/80 dark:text-white/90 max-w-2xl mx-auto bg-white/70 dark:bg-black/40 px-6 py-4 rounded-2xl border-4 border-black/20 dark:border-white/20 shadow-sm backdrop-blur-sm"
              variants={heroChild}
            >
              An educational platform that helps students understand how digital
              content shapes thinking. We don&apos;t judge — we investigate! 🔍✨
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
              variants={heroChild}
            >
              <Link href="/youtube">
                <motion.div
                  className="inline-flex items-center gap-3 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 px-8 py-4 text-lg font-black uppercase tracking-wider text-white border-4 border-black dark:border-white shadow-[6px_6px_0px_rgba(0,0,0,1)] dark:shadow-[6px_6px_0px_rgba(255,255,255,1)] transition-all duration-200"
                  whileHover={{ y: -4, boxShadow: "8px 8px 0px rgba(0,0,0,1)" }}
                  whileTap={{ scale: 0.97 }}
                >
                  Start Investigating
                  <span className="text-2xl">🚀</span>
                </motion.div>
              </Link>
              <Link href="#features">
                <motion.div
                  className="inline-flex items-center gap-3 rounded-2xl bg-white dark:bg-slate-800 px-8 py-4 text-lg font-black uppercase tracking-wider text-black dark:text-white border-4 border-black dark:border-white shadow-[6px_6px_0px_rgba(0,0,0,1)] dark:shadow-[6px_6px_0px_rgba(255,255,255,1)] transition-all duration-200"
                  whileHover={{ y: -4, boxShadow: "8px 8px 0px rgba(0,0,0,1)" }}
                  whileTap={{ scale: 0.97 }}
                >
                  Learn More
                  <span className="text-2xl">👇</span>
                </motion.div>
              </Link>
            </motion.div>

            {/* Trust Badges */}
            <motion.div
              className="flex flex-wrap items-center justify-center gap-3 pt-4"
              variants={heroChild}
            >
              {[
                { label: "No data stored", icon: "🔒" },
                { label: "Fully private", icon: "🛡️" },
                { label: "100% educational", icon: "📚" },
                { label: "Free to use", icon: "✨" },
              ].map((item, i) => (
                <motion.span
                  key={item.label}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/60 dark:bg-black/30 border-2 border-black/20 dark:border-white/20 text-sm font-bold text-black/70 dark:text-white/70"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.2 + i * 0.1, duration: 0.4, ease: "easeOut" }}
                >
                  <span>{item.icon}</span> {item.label}
                </motion.span>
              ))}
            </motion.div>
          </motion.div>
        </div>

        {/* Floating decorative emojis */}
        <div className="absolute top-20 left-[10%] text-4xl animate-float opacity-30 pointer-events-none" style={{ animationDelay: "0s" }}>🔍</div>
        <div className="absolute top-40 right-[15%] text-3xl animate-float opacity-20 pointer-events-none" style={{ animationDelay: "2s" }}>🦉</div>
        <div className="absolute bottom-20 left-[20%] text-3xl animate-float opacity-20 pointer-events-none" style={{ animationDelay: "4s" }}>🐱</div>
        <div className="absolute bottom-40 right-[10%] text-4xl animate-float opacity-25 pointer-events-none" style={{ animationDelay: "1s" }}>💡</div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative z-10 py-16 sm:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center space-y-4 mb-12"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={fadeUp}
          >
            <h2
              className="text-3xl sm:text-4xl lg:text-5xl font-black uppercase tracking-tighter text-white dark:text-slate-900"
              style={{ WebkitTextStroke: "2px black", textShadow: "5px 5px 0px rgba(0,0,0,1)" }}
            >
              Choose Your Mission!
            </h2>
            <p className="text-lg font-bold text-black/70 dark:text-white/80 max-w-xl mx-auto">
              Pick a content type and let our AI detective team go to work! 🕵️‍♂️
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
                <Link href={feature.href}>
                  <motion.div
                    className={`group relative overflow-hidden rounded-2xl border-4 border-black dark:border-white ${feature.bg} p-8 shadow-[6px_6px_0px_rgba(0,0,0,1)] dark:shadow-[6px_6px_0px_rgba(255,255,255,1)] transition-all duration-200 block`}
                    whileHover={{ y: -6, boxShadow: "8px 8px 0px rgba(0,0,0,1)" }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="space-y-4">
                      <div
                        className={`inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${feature.gradient} text-3xl border-3 border-black dark:border-white shadow-[3px_3px_0px_rgba(0,0,0,1)] dark:shadow-[3px_3px_0px_rgba(255,255,255,1)] transition-transform duration-300 group-hover:rotate-6 group-hover:scale-110`}
                      >
                        {feature.icon}
                      </div>
                      <h3 className="text-2xl font-black uppercase tracking-tight text-black dark:text-white">
                        {feature.title}
                      </h3>
                      <p className="text-sm font-bold text-black/70 dark:text-white/80 leading-relaxed">
                        {feature.description}
                      </p>
                      <div className="flex items-center gap-2 text-base font-black uppercase tracking-wider text-black dark:text-white pt-2 transition-all duration-300 group-hover:gap-4">
                        Go! <span className="transition-transform duration-300 group-hover:translate-x-2 text-xl">→</span>
                      </div>
                    </div>
                  </motion.div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* How It Works */}
      <section className="relative z-10 py-16 sm:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center space-y-4 mb-12"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={fadeUp}
          >
            <h2
              className="text-3xl sm:text-4xl lg:text-5xl font-black uppercase tracking-tighter text-white dark:text-slate-900"
              style={{ WebkitTextStroke: "2px black", textShadow: "5px 5px 0px rgba(0,0,0,1)" }}
            >
              How It Works!
            </h2>
            <p className="text-lg font-bold text-black/70 dark:text-white/80 max-w-xl mx-auto">
              Four simple steps to become a media detective! 🕵️
            </p>
          </motion.div>

          <motion.div
            className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            variants={staggerParent}
          >
            {steps.map((step) => (
              <motion.div
                key={step.num}
                className="group"
                variants={fadeUp}
              >
                <motion.div
                  className="text-center space-y-4 rounded-2xl border-4 border-black dark:border-white bg-white dark:bg-slate-800 p-6 shadow-[6px_6px_0px_rgba(0,0,0,1)] dark:shadow-[6px_6px_0px_rgba(255,255,255,1)] transition-all duration-200"
                  whileHover={{ y: -4, boxShadow: "8px 8px 0px rgba(0,0,0,1)" }}
                >
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-3xl border-3 border-black dark:border-white shadow-[3px_3px_0px_rgba(0,0,0,1)] dark:shadow-[3px_3px_0px_rgba(255,255,255,1)] transition-transform duration-300 group-hover:rotate-6">
                    {step.icon}
                  </div>
                  <div className="text-xs font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
                    Step {step.num}
                  </div>
                  <h3 className="font-black text-lg uppercase tracking-tight text-black dark:text-white">
                    {step.label}
                  </h3>
                  <p className="text-sm font-bold text-black/60 dark:text-white/60">{step.desc}</p>
                </motion.div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Characters Section */}
      <section className="relative z-10 py-16 sm:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center space-y-4 mb-12"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={fadeUp}
          >
            <h2
              className="text-3xl sm:text-4xl lg:text-5xl font-black uppercase tracking-tighter text-white dark:text-slate-900"
              style={{ WebkitTextStroke: "2px black", textShadow: "5px 5px 0px rgba(0,0,0,1)" }}
            >
              Meet Your Guides!
            </h2>
            <p className="text-lg font-bold text-black/70 dark:text-white/80 max-w-xl mx-auto">
              Three friendly characters help explain findings in a fun way! 🎉
            </p>
          </motion.div>

          <motion.div
            className="grid gap-6 md:grid-cols-3"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            variants={staggerParent}
          >
            {characters.map((char) => (
              <motion.div
                key={char.name}
                variants={scaleIn}
              >
                <motion.div
                  className={`text-center space-y-4 rounded-2xl border-4 border-black dark:border-white ${char.bg} p-8 shadow-[6px_6px_0px_rgba(0,0,0,1)] dark:shadow-[6px_6px_0px_rgba(255,255,255,1)] transition-all duration-200 group`}
                  whileHover={{ y: -6, boxShadow: "8px 8px 0px rgba(0,0,0,1)" }}
                >
                  <motion.div
                    className={`mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br ${char.gradient} text-4xl border-3 border-black dark:border-white shadow-[3px_3px_0px_rgba(0,0,0,1)] dark:shadow-[3px_3px_0px_rgba(255,255,255,1)]`}
                    whileHover={{ rotate: 12, scale: 1.1 }}
                  >
                    {char.emoji}
                  </motion.div>
                  <h3 className="text-xl font-black uppercase tracking-tight text-black dark:text-white">
                    {char.name}
                  </h3>
                  <p className="text-sm font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                    {char.role}
                  </p>
                  <p className="text-sm font-bold text-black/70 dark:text-white/80">{char.desc}</p>
                </motion.div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t-4 border-black dark:border-white py-8 bg-white/50 dark:bg-black/30">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <motion.div
            className="flex flex-col sm:flex-row items-center justify-between gap-4"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-black border-2 border-black dark:border-white shadow-[2px_2px_0px_rgba(0,0,0,1)]">
                UB
              </div>
              <span className="font-black uppercase tracking-wide text-black dark:text-white text-sm">
                Unbiasy — Educational Bias Awareness
              </span>
            </div>
            <p className="text-sm font-bold text-black/60 dark:text-white/60 flex items-center gap-2">
              <span>🔒</span> No data stored. All analysis is processed in memory.
            </p>
          </motion.div>
        </div>
      </footer>
    </div>
  );
}
