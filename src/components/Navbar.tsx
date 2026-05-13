"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";

const navLinks = [
    { href: "/youtube", label: "YouTube", icon: "🎬", color: "from-red-500 to-pink-500", activeColor: "bg-red-100 dark:bg-red-900/50" },
    { href: "/pdf", label: "PDF / Text", icon: "📄", color: "from-blue-500 to-cyan-500", activeColor: "bg-blue-100 dark:bg-blue-900/50" },
    { href: "/image", label: "Image", icon: "🖼️", color: "from-purple-500 to-violet-500", activeColor: "bg-purple-100 dark:bg-purple-900/50" },
];

export function Navbar() {
    const pathname = usePathname();

    return (
        <nav className="sticky top-0 z-50 bg-yellow-50 dark:bg-slate-900 border-b-4 border-black dark:border-white">
            <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-2.5 group">
                    <motion.div
                        className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-black text-sm border-3 border-black dark:border-white shadow-[3px_3px_0px_rgba(0,0,0,1)] dark:shadow-[3px_3px_0px_rgba(255,255,255,1)] transition-all duration-200 group-hover:shadow-[4px_4px_0px_rgba(0,0,0,1)] group-hover:-translate-y-0.5"
                        whileHover={{ rotate: -6 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        UB
                    </motion.div>
                    <span className="text-xl font-black uppercase tracking-tight text-black dark:text-white hidden sm:inline">
                        Unbiasy
                    </span>
                </Link>

                {/* Nav Links */}
                <div className="flex items-center gap-2">
                    {navLinks.map((link) => {
                        const isActive = pathname === link.href;
                        return (
                            <Link
                                key={link.href}
                                href={link.href}
                            >
                                <motion.div
                                    className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-black uppercase tracking-wide border-2 transition-all duration-200
                                        ${isActive
                                            ? `${link.activeColor} border-black dark:border-white shadow-[3px_3px_0px_rgba(0,0,0,1)] dark:shadow-[3px_3px_0px_rgba(255,255,255,1)] text-black dark:text-white`
                                            : "border-transparent text-black/60 dark:text-white/60 hover:border-black/30 dark:hover:border-white/30 hover:bg-white/50 dark:hover:bg-black/20"
                                        }`}
                                    whileHover={{ y: -2 }}
                                    whileTap={{ scale: 0.97 }}
                                >
                                    <span className="text-base">{link.icon}</span>
                                    <span className="hidden sm:inline">{link.label}</span>
                                </motion.div>
                            </Link>
                        );
                    })}
                </div>

                {/* Decorative element */}
                {/* <div className="hidden sm:flex items-center gap-1 text-lg">
                    <span className="animate-float" style={{ animationDelay: "0s" }}>🔍</span>
                    <span className="animate-float" style={{ animationDelay: "0.3s" }}>🦉</span>
                    <span className="animate-float" style={{ animationDelay: "0.6s" }}>🐱</span>
                </div> */}
            </div>
        </nav>
    );
}
