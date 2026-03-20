"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";

const education = [
  {
    degree: "MSc Mathematics in Science and Engineering",
    school: "Technical University of Munich (TUM)",
    location: "Munich, Germany",
    period: "Oct 2022 - Present",
    description:
      "Specializing in machine learning, optimization, and numerical analysis. Coursework includes deep learning, statistical learning theory, advanced numerical methods, and mathematical foundations of ML.",
    highlights: [
      "Master's Thesis: Neural Network Identifiability Analysis",
      "Advanced Seminars in Machine Learning",
      "Research Assistant in Programming & MATLAB",
    ],
    logo: "TUM",
  },
  {
    degree: "BSc (Hons) Mathematics",
    school: "Aligarh Muslim University (AMU)",
    location: "Aligarh, India",
    period: "Jul 2017 - Mar 2021",
    description:
      "Strong foundation in pure and applied mathematics including real analysis, linear algebra, differential equations, probability theory, and computational mathematics.",
    highlights: [
      "Summer Research Intern at IISER Bhopal",
      "Focus on Computational & Applied Mathematics",
      "Dean's List Recognition",
    ],
    logo: "AMU",
  },
];

export default function Education() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="education" className="relative" ref={ref}>
      <div className="absolute inset-0 glow-bottom-left pointer-events-none" />
      <div className="section-container">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="mb-16"
        >
          <span className="font-mono text-sm text-emerald-500 tracking-wider">
            05 / EDUCATION
          </span>
          <h2 className="section-title mt-2">
            <span className="text-white">Academic </span>
            <span className="gradient-text">Background</span>
          </h2>
          <div className="w-20 h-1 bg-gradient-to-r from-emerald-500 to-transparent rounded-full mt-4" />
        </motion.div>

        {/* Education cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl">
          {education.map((edu, i) => (
            <motion.div
              key={edu.school}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: i * 0.2 }}
              className="glass-card p-8 group relative overflow-hidden"
            >
              {/* Background glow */}
              <div className="absolute -top-20 -right-20 w-40 h-40 bg-emerald-500/5 rounded-full blur-3xl group-hover:bg-emerald-500/10 transition-all duration-700" />

              {/* Logo badge */}
              <div className="relative mb-6 flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0 group-hover:border-emerald-500/40 transition-colors">
                  <span className="font-display text-lg font-bold text-emerald-400">
                    {edu.logo}
                  </span>
                </div>
                <div>
                  <span className="font-mono text-xs text-dark-500">
                    {edu.period}
                  </span>
                  <p className="text-xs text-dark-400 mt-0.5">
                    {edu.location}
                  </p>
                </div>
              </div>

              {/* Degree */}
              <h3 className="text-xl font-semibold text-white mb-1 group-hover:text-emerald-400 transition-colors">
                {edu.degree}
              </h3>
              <p className="text-sm text-emerald-500 font-medium mb-4">
                {edu.school}
              </p>

              {/* Description */}
              <p className="text-sm text-dark-400 leading-relaxed mb-6">
                {edu.description}
              </p>

              {/* Highlights */}
              <ul className="space-y-2">
                {edu.highlights.map((h, j) => (
                  <li
                    key={j}
                    className="flex items-center gap-2 text-sm text-dark-300"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                    {h}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
