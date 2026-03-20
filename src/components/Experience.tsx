"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";

interface ExperienceItem {
  title: string;
  company: string;
  location: string;
  period: string;
  type: string;
  description: string[];
  technologies: string[];
}

const experiences: ExperienceItem[] = [
  {
    title: "Working Student - AI Engineer",
    company: "BP-ITCS (IT Consulting & Solutions)",
    location: "Munich, Germany",
    period: "Oct 2024 - Present",
    type: "Part-time",
    description: [
      "Developing and deploying production-grade ML models for business process automation and predictive analytics",
      "Building end-to-end data pipelines and implementing MLOps best practices for model monitoring and retraining",
      "Collaborating with cross-functional teams to translate business requirements into AI-driven solutions",
    ],
    technologies: ["Python", "TensorFlow", "SQL", "Power BI", "Azure"],
  },
  {
    title: "Master's Thesis Researcher",
    company: "Technical University of Munich (TUM)",
    location: "Munich, Germany",
    period: "Apr 2024 - Oct 2024",
    type: "Research",
    description: [
      "Conducted research on neural network identifiability analysis, investigating theoretical properties of deep learning architectures",
      "Developed mathematical frameworks for analyzing convergence and uniqueness properties of neural network solutions",
      "Implemented computational experiments using PyTorch to validate theoretical results on synthetic and real datasets",
    ],
    technologies: ["Python", "PyTorch", "LaTeX", "NumPy", "Matplotlib"],
  },
  {
    title: "Seminar Participant - Advanced ML",
    company: "Technical University of Munich (TUM)",
    location: "Munich, Germany",
    period: "Oct 2023 - Feb 2024",
    type: "Academic",
    description: [
      "Participated in advanced seminar on modern machine learning topics including transformers, attention mechanisms, and self-supervised learning",
      "Presented research paper reviews and critical analyses of state-of-the-art deep learning methods",
    ],
    technologies: ["Deep Learning", "Transformers", "Research", "LaTeX"],
  },
  {
    title: "Research Assistant - Programming",
    company: "Technical University of Munich (TUM)",
    location: "Munich, Germany",
    period: "Apr 2023 - Sep 2023",
    type: "Part-time",
    description: [
      "Assisted in developing programming exercises and course materials for undergraduate computer science modules",
      "Created automated testing frameworks and grading scripts for student submissions",
      "Provided tutoring and support for students in programming fundamentals and data structures",
    ],
    technologies: ["Python", "Java", "Git", "Testing Frameworks"],
  },
  {
    title: "Intern - Data Analytics",
    company: "AUDI AG",
    location: "Ingolstadt, Germany",
    period: "Oct 2022 - Mar 2023",
    type: "Internship",
    description: [
      "Analyzed supply chain data to identify bottlenecks and optimize logistics processes using advanced analytics",
      "Built interactive Power BI dashboards for real-time KPI monitoring and executive reporting",
      "Implemented VBA automation scripts reducing manual data processing time by 40%",
    ],
    technologies: ["Power BI", "VBA", "Excel", "SQL", "Python"],
  },
  {
    title: "Research Assistant - MATLAB",
    company: "Technical University of Munich (TUM)",
    location: "Munich, Germany",
    period: "Apr 2022 - Sep 2022",
    type: "Part-time",
    description: [
      "Developed numerical simulation tools in MATLAB for mathematical modeling research projects",
      "Implemented finite element methods and optimization algorithms for engineering applications",
    ],
    technologies: ["MATLAB", "Numerical Methods", "LaTeX", "Simulink"],
  },
  {
    title: "Summer Research Intern",
    company: "IISER Bhopal",
    location: "Bhopal, India",
    period: "May 2019 - Jul 2019",
    type: "Internship",
    description: [
      "Conducted research in mathematical analysis and computational methods under faculty supervision",
      "Applied analytical and numerical techniques to solve research problems in applied mathematics",
    ],
    technologies: ["MATLAB", "Python", "LaTeX", "Mathematics"],
  },
];

export default function Experience() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="experience" className="relative" ref={ref}>
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
            02 / EXPERIENCE
          </span>
          <h2 className="section-title mt-2">
            <span className="text-white">Work </span>
            <span className="gradient-text">Experience</span>
          </h2>
          <p className="section-subtitle mt-4">
            A journey through research, engineering, and data science across
            academia and industry.
          </p>
          <div className="w-20 h-1 bg-gradient-to-r from-emerald-500 to-transparent rounded-full mt-4" />
        </motion.div>

        {/* Timeline */}
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-[23px] md:left-[31px] top-0 bottom-0 w-px bg-gradient-to-b from-emerald-500/50 via-emerald-500/20 to-transparent" />

          <div className="space-y-8">
            {experiences.map((exp, i) => (
              <motion.div
                key={`${exp.company}-${exp.period}`}
                initial={{ opacity: 0, x: -20 }}
                animate={isInView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="relative pl-14 md:pl-20 group"
              >
                {/* Timeline dot */}
                <div className="absolute left-[16px] md:left-[24px] top-2 z-10">
                  <div className="w-[14px] h-[14px] rounded-full border-2 border-emerald-500 bg-dark-950 group-hover:bg-emerald-500 transition-colors duration-300">
                    <div className="absolute inset-0 rounded-full bg-emerald-500/20 scale-0 group-hover:scale-[2.5] transition-transform duration-500" />
                  </div>
                </div>

                {/* Card */}
                <div className="glass-card p-6 md:p-8">
                  {/* Header */}
                  <div className="flex flex-wrap items-start justify-between gap-2 mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-white group-hover:text-emerald-400 transition-colors">
                        {exp.title}
                      </h3>
                      <p className="text-sm text-emerald-500 font-medium mt-0.5">
                        {exp.company}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="font-mono text-xs text-dark-400">
                        {exp.period}
                      </span>
                      <div className="flex items-center gap-2 mt-1 justify-end">
                        <span className="text-xs text-dark-500">
                          {exp.location}
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          {exp.type}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <ul className="space-y-2 mb-4">
                    {exp.description.map((desc, j) => (
                      <li
                        key={j}
                        className="flex items-start gap-2 text-sm text-dark-300"
                      >
                        <span className="text-emerald-500 mt-1.5 shrink-0">
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M9 5l7 7-7 7" stroke="currentColor" fill="none" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </span>
                        <span>{desc}</span>
                      </li>
                    ))}
                  </ul>

                  {/* Technologies */}
                  <div className="flex flex-wrap gap-2">
                    {exp.technologies.map((tech) => (
                      <span key={tech} className="skill-badge">
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
