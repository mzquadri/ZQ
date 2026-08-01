"use client";

import { useRef, useState } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";

const FloatingLaptopCanvas = dynamic(() => import("./FloatingLaptopCanvas"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-dark-900/30 rounded-2xl animate-pulse flex items-center justify-center">
      <span className="text-xs font-mono text-dark-600">Loading 3D...</span>
    </div>
  ),
});

interface Project {
  title: string;
  description: string;
  tags: string[];
  category: string;
  github?: string;
  demo?: string;
  featured?: boolean;
}

const categories = ["All", "Research", "Deep Learning", "NLP", "Time Series", "Applied ML", "MLOps"];

const projects: Project[] = [
  {
    title: "MLOps End-to-End Pipeline",
    description:
      "Reference sentiment-classification pipeline with container configuration, FastAPI serving, validation checks, and automated test coverage.",
    tags: ["Python", "Docker", "FastAPI", "pytest", "GitHub Actions"],
    category: "MLOps",
    github: "https://github.com/mzquadri/MLOps-End-to-End-Pipeline",
    featured: true,
  },
  {
    title: "NLP Text Classification with Transformers",
    description:
      "Experimental AG News classification pipeline with an explicit offline synthetic fixture and reproducibility-oriented evaluation code.",
    tags: ["Python", "scikit-learn", "Transformers", "NLP"],
    category: "NLP",
    github: "https://github.com/mzquadri/NLP-Text-Classification-Transformers",
    featured: true,
  },
  {
    title: "Neural Network Identifiability Analysis",
    description:
      "Educational numerical tools for studying neural-network symmetries, with tested hidden-unit permutation and sign-flip checks.",
    tags: ["Python", "NumPy", "Mathematics", "Research"],
    category: "Research",
    github: "https://github.com/mzquadri/Neural-Network-Identifiability-Analysis",
    featured: true,
  },
  {
    title: "Insurance Claims Prediction",
    description:
      "Research pipeline for claims-risk modelling that prevents preprocessing leakage and documents validation requirements.",
    tags: ["Python", "scikit-learn", "Pandas", "SHAP"],
    category: "Applied ML",
    github: "https://github.com/mzquadri/Insurance-Claims-Prediction-ML",
    featured: true,
  },
  {
    title: "Supply Chain Analytics Dashboard",
    description:
      "Exploratory analytics and forecasting code with chronological holdouts and clearly documented supplier-risk proxies.",
    tags: ["Python", "Pandas", "Plotly", "statsmodels"],
    category: "Applied ML",
    github: "https://github.com/mzquadri/Supply-Chain-Analytics-Dashboard",
    featured: true,
  },
  {
    title: "Battery SOC Estimation with ML",
    description:
      "Battery state-of-charge research prototype with NASA-compatible loaders, feature engineering, and reproducible smoke checks.",
    tags: ["Python", "scikit-learn", "Time Series", "NumPy"],
    category: "Applied ML",
    github: "https://github.com/mzquadri/Battery-SOC-Estimation-ML",
    featured: true,
  },
  {
    title: "CNN Image Classification",
    description:
      "CIFAR-10 CNN experiment with tracked evaluation plots, configuration, and a documented reference run.",
    tags: ["PyTorch", "CNN", "CIFAR-10", "Computer Vision"],
    category: "Deep Learning",
    github: "https://github.com/mzquadri/CNN-Image-Classification-PyTorch",
  },
  {
    title: "Flood Prediction with LSTM",
    description:
      "Deterministic synthetic one-step-ahead discharge forecasting experiment with tracked model and evaluation artifacts.",
    tags: ["Python", "TensorFlow", "LSTM", "Time Series"],
    category: "Time Series",
    github: "https://github.com/mzquadri/Deep-Learning-Flood-Prediction-LSTM",
  },
  {
    title: "Streamflow Forecasting",
    description:
      "Synthetic streamflow benchmark comparing SARIMAX and XGBoost under documented one-step-ahead evaluation.",
    tags: ["Python", "SARIMAX", "XGBoost", "Time Series"],
    category: "Time Series",
    github: "https://github.com/mzquadri/Time-Series-Streamflow-Forecasting",
  },
];

export default function Projects() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [activeFilter, setActiveFilter] = useState("All");
  const [showAll, setShowAll] = useState(false);

  const filtered =
    activeFilter === "All"
      ? projects
      : projects.filter((p) => p.category === activeFilter);

  const displayed = showAll ? filtered : filtered.slice(0, 6);

  return (
    <section id="projects" className="relative" ref={ref}>
      <div className="absolute inset-0 glow-center pointer-events-none" />
      <div className="section-container">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="mb-12"
        >
          <span className="font-mono text-sm text-emerald-500 tracking-wider">
            03 / PROJECTS
          </span>
          <h2 className="section-title mt-2">
            <span className="text-white">Featured </span>
            <span className="gradient-text">Projects</span>
          </h2>
          <p className="section-subtitle mt-4">
            A curated selection of public repositories with source code and
            clearly scoped results. Experimental and synthetic-data work is
            labelled accordingly in its documentation.
          </p>
          <div className="w-20 h-1 bg-gradient-to-r from-emerald-500 to-transparent rounded-full mt-4" />
        </motion.div>

        {/* 3D Laptop Showcase */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={isInView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.8, delay: 0.15 }}
          className="scene-reveal parallax-3d mb-12 h-[320px] md:h-[380px] rounded-2xl border border-emerald-500/10 overflow-hidden relative"
        >
          <FloatingLaptopCanvas />
          <div className="absolute bottom-3 right-4">
            <span className="font-mono text-[10px] text-dark-600 tracking-wider uppercase">
              Move mouse to interact
            </span>
          </div>
        </motion.div>

        {/* Filter tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex flex-wrap gap-2 mb-10"
        >
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => {
                setActiveFilter(cat);
                setShowAll(false);
              }}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                activeFilter === cat
                  ? "bg-emerald-500 text-dark-950 shadow-lg shadow-emerald-500/25"
                  : "bg-dark-800/50 text-dark-400 border border-dark-700 hover:border-emerald-500/30 hover:text-white"
              }`}
            >
              {cat}
            </button>
          ))}
        </motion.div>

        {/* Project grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="wait">
            {displayed.map((project, i) => (
              <motion.div
                key={project.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
                className="glass-card p-6 group flex flex-col relative overflow-hidden"
              >
                {/* Featured badge */}
                {project.featured && (
                  <div className="absolute top-4 right-4">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      Featured
                    </span>
                  </div>
                )}

                {/* Category dot */}
                <div className="flex items-center gap-2 mb-4">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="font-mono text-xs text-dark-500 uppercase tracking-wider">
                    {project.category}
                  </span>
                </div>

                {/* Title */}
                <h3 className="text-lg font-semibold text-white mb-3 group-hover:text-emerald-400 transition-colors">
                  {project.title}
                </h3>

                {/* Description */}
                <p className="text-sm text-dark-400 leading-relaxed mb-4 flex-grow">
                  {project.description}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {project.tags.map((tag) => (
                    <span key={tag} className="tag">
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Links */}
                <div className="flex items-center gap-3 pt-4 border-t border-dark-800">
                  {project.github && (
                    <a
                      href={project.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-sm text-dark-400 hover:text-emerald-400 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                      </svg>
                      Source Code
                    </a>
                  )}
                  {project.demo && (
                    <a
                      href={project.demo}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-sm text-dark-400 hover:text-emerald-400 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                      Live Demo
                    </a>
                  )}
                </div>

                {/* Hover glow */}
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl" />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Show more */}
        {filtered.length > 6 && !showAll && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ delay: 0.5 }}
            className="text-center mt-10"
          >
            <button
              onClick={() => setShowAll(true)}
              className="btn-outline"
            >
              Show All Projects ({filtered.length})
            </button>
          </motion.div>
        )}
      </div>
    </section>
  );
}
