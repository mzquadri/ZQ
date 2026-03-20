"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";

interface SkillCategory {
  name: string;
  icon: React.ReactNode;
  skills: { name: string; level: number }[];
}

const skillCategories: SkillCategory[] = [
  {
    name: "Programming & Core",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
      </svg>
    ),
    skills: [
      { name: "Python", level: 95 },
      { name: "SQL", level: 90 },
      { name: "MATLAB", level: 80 },
      { name: "VBA", level: 75 },
      { name: "Java", level: 65 },
      { name: "Git / GitHub", level: 85 },
    ],
  },
  {
    name: "Machine Learning & AI",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
      </svg>
    ),
    skills: [
      { name: "TensorFlow / Keras", level: 90 },
      { name: "PyTorch", level: 85 },
      { name: "scikit-learn", level: 92 },
      { name: "Transformers / NLP", level: 80 },
      { name: "Computer Vision", level: 75 },
      { name: "MLOps / MLflow", level: 78 },
    ],
  },
  {
    name: "Data Science & Analytics",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
      </svg>
    ),
    skills: [
      { name: "Pandas / NumPy", level: 95 },
      { name: "Power BI", level: 85 },
      { name: "Advanced Excel", level: 90 },
      { name: "MySQL / SQL Server", level: 85 },
      { name: "Matplotlib / Plotly", level: 85 },
      { name: "Statistical Analysis", level: 88 },
    ],
  },
  {
    name: "Tools & Infrastructure",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.42 15.17l-5.1-3.07a1.07 1.07 0 010-1.83l5.1-3.07a1.06 1.06 0 011.17 0l5.1 3.07a1.07 1.07 0 010 1.83l-5.1 3.07a1.06 1.06 0 01-1.17 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6.32 12.17l-5.1 3.07a1.07 1.07 0 000 1.83l5.1 3.07a1.06 1.06 0 001.17 0l5.1-3.07a1.07 1.07 0 000-1.83l-5.1-3.07" />
      </svg>
    ),
    skills: [
      { name: "Docker", level: 75 },
      { name: "Linux / Bash", level: 80 },
      { name: "CI/CD (GitHub Actions)", level: 78 },
      { name: "Jupyter / Colab", level: 92 },
      { name: "FastAPI / Flask", level: 75 },
      { name: "LaTeX", level: 85 },
    ],
  },
];

export default function Skills() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="skills" className="relative" ref={ref}>
      <div className="absolute inset-0 glow-top-right pointer-events-none" />
      <div className="section-container">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="mb-16"
        >
          <span className="font-mono text-sm text-emerald-500 tracking-wider">
            04 / SKILLS
          </span>
          <h2 className="section-title mt-2">
            <span className="text-white">Technical </span>
            <span className="gradient-text">Skills</span>
          </h2>
          <p className="section-subtitle mt-4">
            A comprehensive toolkit spanning programming, ML frameworks, data
            analytics, and infrastructure.
          </p>
          <div className="w-20 h-1 bg-gradient-to-r from-emerald-500 to-transparent rounded-full mt-4" />
        </motion.div>

        {/* Skill categories grid */}
        <div className="grid md:grid-cols-2 gap-8">
          {skillCategories.map((category, catIndex) => (
            <motion.div
              key={category.name}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: catIndex * 0.15 }}
              className="glass-card p-6 md:p-8"
            >
              {/* Category header */}
              <div className="flex items-center gap-3 mb-6">
                <div className="text-emerald-500">{category.icon}</div>
                <h3 className="text-base font-semibold text-white">
                  {category.name}
                </h3>
              </div>

              {/* Skills */}
              <div className="space-y-4">
                {category.skills.map((skill, skillIndex) => (
                  <motion.div
                    key={skill.name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={isInView ? { opacity: 1, x: 0 } : {}}
                    transition={{
                      duration: 0.4,
                      delay: catIndex * 0.15 + skillIndex * 0.05,
                    }}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-sm text-dark-300">
                        {skill.name}
                      </span>
                      <span className="font-mono text-xs text-dark-500">
                        {skill.level}%
                      </span>
                    </div>
                    <div className="h-1.5 bg-dark-800 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={
                          isInView ? { width: `${skill.level}%` } : { width: 0 }
                        }
                        transition={{
                          duration: 1,
                          delay: catIndex * 0.15 + skillIndex * 0.05 + 0.3,
                          ease: "easeOut",
                        }}
                        className="h-full rounded-full bg-gradient-to-r from-emerald-600 to-emerald-400"
                        style={{
                          boxShadow: "0 0 10px rgba(16, 185, 129, 0.3)",
                        }}
                      />
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Additional skills tags */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mt-12 text-center"
        >
          <p className="text-sm text-dark-500 mb-4 font-mono">
            Also experienced with:
          </p>
          <div className="flex flex-wrap justify-center gap-2 max-w-3xl mx-auto">
            {[
              "Hugging Face",
              "Weights & Biases",
              "Azure ML",
              "Spark",
              "Airflow",
              "dbt",
              "Streamlit",
              "OpenCV",
              "ONNX",
              "REST APIs",
              "Agile/Scrum",
              "Data Modeling",
            ].map((skill) => (
              <span key={skill} className="skill-badge">
                {skill}
              </span>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
