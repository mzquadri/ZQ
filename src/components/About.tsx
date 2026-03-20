"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import dynamic from "next/dynamic";

const GeometricAvatarCanvas = dynamic(() => import("./GeometricAvatarCanvas"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-dark-900/30 rounded-2xl animate-pulse flex items-center justify-center">
      <span className="text-xs font-mono text-dark-600">Loading 3D...</span>
    </div>
  ),
});

const highlights = [
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
    title: "AI & Machine Learning",
    description:
      "Building production-grade ML pipelines, from data preprocessing to model deployment with TensorFlow, PyTorch, and scikit-learn.",
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342M6.75 15a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm0 0v-3.675A55.378 55.378 0 0 1 12 8.443m-7.007 11.55A5.981 5.981 0 0 0 6.75 15.75v-1.5" />
      </svg>
    ),
    title: "Mathematics & Research",
    description:
      "Strong foundation in mathematical optimization, statistics, numerical methods, and neural network theory from TU Munich.",
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
      </svg>
    ),
    title: "MLOps & Engineering",
    description:
      "End-to-end ML systems with CI/CD, Docker, model monitoring, and automated retraining pipelines for production environments.",
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7.5 14.25v2.25m3-4.5v4.5m3-6.75v6.75m3-9v9M6 20.25h12A2.25 2.25 0 0020.25 18V6A2.25 2.25 0 0018 3.75H6A2.25 2.25 0 003.75 6v12A2.25 2.25 0 006 20.25z" />
      </svg>
    ),
    title: "Data Analytics & BI",
    description:
      "Transforming complex data into actionable insights with Power BI, advanced Excel, SQL, and statistical analysis.",
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.1 },
  }),
};

export default function About() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="about" className="relative" ref={ref}>
      <div className="absolute inset-0 glow-center pointer-events-none" />
      <div className="section-container">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="mb-16"
        >
          <span className="font-mono text-sm text-emerald-500 tracking-wider">
            01 / ABOUT
          </span>
          <h2 className="section-title mt-2">
            <span className="text-white">About </span>
            <span className="gradient-text">Me</span>
          </h2>
          <div className="w-20 h-1 bg-gradient-to-r from-emerald-500 to-transparent rounded-full mt-4" />
        </motion.div>

        <div className="grid lg:grid-cols-5 gap-12 items-start">
          {/* Left column - Bio */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:col-span-2 space-y-6"
          >
            {/* 3D Geometric Avatar */}
            <div className="scene-reveal relative w-72 h-80 mx-auto lg:mx-0 rounded-2xl overflow-hidden border border-emerald-500/10 group">
              <GeometricAvatarCanvas />
              {/* Label overlay */}
              <div className="absolute bottom-3 left-0 right-0 text-center">
                <span className="font-mono text-[10px] text-dark-600 tracking-wider uppercase">
                  Interactive 3D
                </span>
              </div>
            </div>

            {/* Quick info */}
            <div className="space-y-3">
              {[
                { label: "Location", value: "Munich, Germany" },
                { label: "University", value: "TU Munich (TUM)" },
                { label: "Degree", value: "MSc Mathematics in Science & Engineering" },
                { label: "Focus", value: "AI, ML, Deep Learning, NLP" },
                { label: "Languages", value: "English, German, Hindi" },
              ].map((item, i) => (
                <motion.div
                  key={item.label}
                  custom={i}
                  initial="hidden"
                  animate={isInView ? "visible" : "hidden"}
                  variants={fadeUp}
                  className="flex items-baseline gap-3"
                >
                  <span className="font-mono text-xs text-dark-500 w-24 shrink-0 uppercase tracking-wider">
                    {item.label}
                  </span>
                  <span className="text-sm text-dark-200">{item.value}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Right column - Description + Highlights */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="lg:col-span-3 space-y-8"
          >
            <div className="space-y-4 text-dark-300 leading-relaxed">
              <p>
                I am a Master&apos;s student in{" "}
                <span className="text-white font-medium">
                  Mathematics in Science and Engineering
                </span>{" "}
                at the Technical University of Munich, with a deep passion for
                applying mathematical rigor to real-world AI challenges.
              </p>
              <p>
                My journey spans from theoretical mathematics at Aligarh Muslim
                University to hands-on AI engineering at{" "}
                <span className="text-emerald-400 font-medium">BP-ITCS</span>,
                where I build production-grade machine learning systems. I have
                experience in NLP, computer vision, time-series analysis, and
                end-to-end MLOps pipelines.
              </p>
              <p>
                I thrive at the intersection of{" "}
                <span className="text-white font-medium">
                  mathematics and software engineering
                </span>
                , using tools like Python, TensorFlow, PyTorch, and SQL to
                transform complex data into intelligent systems. From optimizing
                neural network architectures to building interactive dashboards,
                I bring a data-driven approach to every problem.
              </p>
            </div>

            {/* Highlight cards */}
            <div className="grid sm:grid-cols-2 gap-4">
              {highlights.map((item, i) => (
                <motion.div
                  key={item.title}
                  custom={i + 3}
                  initial="hidden"
                  animate={isInView ? "visible" : "hidden"}
                  variants={fadeUp}
                  className="glass-card p-5 group"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="text-emerald-500 group-hover:text-emerald-400 transition-colors">
                      {item.icon}
                    </div>
                    <h3 className="text-sm font-semibold text-white">
                      {item.title}
                    </h3>
                  </div>
                  <p className="text-xs text-dark-400 leading-relaxed">
                    {item.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
