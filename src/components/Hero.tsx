"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import dynamic from "next/dynamic";

// Dynamic import for 3D scene (no SSR)
const Scene3D = dynamic(() => import("./Scene3D"), { ssr: false });

const roles = [
  "AI Engineer",
  "Data Scientist",
  "Machine Learning Engineer",
  "Deep Learning Researcher",
  "NLP Specialist",
  "MLOps Engineer",
];

const stats = [
  { label: "Years Experience", value: "3+" },
  { label: "Projects Completed", value: "18+" },
  { label: "Technologies", value: "25+" },
  { label: "Certifications", value: "5" },
];

export default function Hero() {
  const [roleIndex, setRoleIndex] = useState(0);
  const [displayText, setDisplayText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const tick = useCallback(() => {
    const currentRole = roles[roleIndex];

    if (!isDeleting) {
      setDisplayText(currentRole.substring(0, displayText.length + 1));
      if (displayText === currentRole) {
        setTimeout(() => setIsDeleting(true), 2000);
        return;
      }
    } else {
      setDisplayText(currentRole.substring(0, displayText.length - 1));
      if (displayText === "") {
        setIsDeleting(false);
        setRoleIndex((prev) => (prev + 1) % roles.length);
        return;
      }
    }
  }, [displayText, isDeleting, roleIndex]);

  useEffect(() => {
    const speed = isDeleting ? 50 : 100;
    const timer = setTimeout(tick, speed);
    return () => clearTimeout(timer);
  }, [tick, isDeleting]);

  return (
    <section
      id="hero"
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      {/* 3D Background */}
      <Scene3D />

      {/* Radial glow overlays */}
      <div className="absolute inset-0 glow-top-right pointer-events-none" />
      <div className="absolute inset-0 glow-bottom-left pointer-events-none" />
      <div className="absolute inset-0 grid-pattern pointer-events-none opacity-40" />

      {/* Content */}
      <div className="relative z-10 section-container text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="space-y-6"
        >
          {/* Greeting */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex items-center justify-center gap-2"
          >
            <span className="dot-indicator" />
            <span className="font-mono text-sm text-emerald-400 tracking-wider uppercase">
              Available for opportunities
            </span>
          </motion.div>

          {/* Name */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight"
          >
            <span className="text-white">Mohd Zamin</span>{" "}
            <span className="gradient-text">Quadri</span>
          </motion.h1>

          {/* Typing effect */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="h-10 flex items-center justify-center"
          >
            <span className="font-display text-xl md:text-2xl text-dark-300">
              {"// "}
            </span>
            <span className="font-display text-xl md:text-2xl text-emerald-400 text-glow">
              {displayText}
            </span>
            <span className="font-display text-xl md:text-2xl text-emerald-500 animate-pulse">
              |
            </span>
          </motion.div>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.9 }}
            className="max-w-2xl mx-auto text-dark-400 text-base md:text-lg leading-relaxed"
          >
            MSc Mathematics in Science & Engineering at{" "}
            <span className="text-white font-medium">TU Munich</span>.
            Building intelligent systems at the intersection of mathematics,
            machine learning, and software engineering.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.1 }}
            className="flex flex-wrap items-center justify-center gap-4 pt-4"
          >
            <button
              onClick={() =>
                document
                  .getElementById("projects")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
              className="btn-primary"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              View Projects
            </button>
            <button
              onClick={() =>
                document
                  .getElementById("contact")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
              className="btn-outline"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Get In Touch
            </button>
            <a
              href="https://github.com/mzquadri"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-outline"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
              GitHub
            </a>
          </motion.div>
        </motion.div>

        {/* Stats bar */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.4 }}
          className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto"
        >
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.5 + i * 0.1 }}
              className="text-center p-4 rounded-xl border border-emerald-500/10 bg-dark-900/40 backdrop-blur-sm"
            >
              <div className="font-display text-2xl md:text-3xl font-bold text-emerald-400 text-glow">
                {stat.value}
              </div>
              <div className="text-xs font-mono text-dark-500 mt-1 uppercase tracking-wider">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="flex flex-col items-center gap-2 text-dark-500"
          >
            <span className="text-xs font-mono">scroll</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
