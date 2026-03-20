"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";

const certifications = [
  {
    title: "Improving Deep Neural Networks",
    issuer: "Coursera (deeplearning.ai)",
    description:
      "Hyperparameter tuning, regularization, optimization algorithms, batch normalization, and practical aspects of building deep learning systems.",
    skills: ["Hyperparameter Tuning", "Regularization", "Optimization"],
  },
  {
    title: "Neural Networks and Deep Learning",
    issuer: "Coursera (deeplearning.ai)",
    description:
      "Foundations of deep learning — building and training neural networks, vectorization, gradient descent, and understanding forward/backward propagation.",
    skills: ["Neural Networks", "Backpropagation", "Vectorization"],
  },
  {
    title: "Python for Data Analysis",
    issuer: "Coursera",
    description:
      "Data manipulation and analysis with Python, including Pandas, NumPy, data cleaning, transformation, and exploratory data analysis techniques.",
    skills: ["Pandas", "NumPy", "EDA", "Data Cleaning"],
  },
  {
    title: "Introduction to SQL",
    issuer: "Coursera",
    description:
      "Fundamentals of SQL for data querying, filtering, aggregation, joins, subqueries, and database management for analytics workflows.",
    skills: ["SQL", "Joins", "Aggregation", "Database"],
  },
  {
    title: "Introduction to Python",
    issuer: "Coursera",
    description:
      "Core Python programming concepts including data types, control flow, functions, OOP, file handling, and libraries for data science.",
    skills: ["Python", "OOP", "Data Structures"],
  },
];

export default function Certifications() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="certifications" className="relative" ref={ref}>
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
            06 / CERTIFICATIONS
          </span>
          <h2 className="section-title mt-2">
            <span className="text-white">Certifications </span>
            <span className="gradient-text">& Courses</span>
          </h2>
          <div className="w-20 h-1 bg-gradient-to-r from-emerald-500 to-transparent rounded-full mt-4" />
        </motion.div>

        {/* Certification cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {certifications.map((cert, i) => (
            <motion.div
              key={cert.title}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="glass-card p-6 group relative overflow-hidden"
            >
              {/* Badge icon */}
              <div className="mb-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center group-hover:border-emerald-500/40 transition-colors">
                  <svg
                    className="w-5 h-5 text-emerald-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342"
                    />
                  </svg>
                </div>
                <span className="font-mono text-xs text-dark-500">
                  {cert.issuer}
                </span>
              </div>

              {/* Title */}
              <h3 className="text-base font-semibold text-white mb-3 group-hover:text-emerald-400 transition-colors">
                {cert.title}
              </h3>

              {/* Description */}
              <p className="text-sm text-dark-400 leading-relaxed mb-4">
                {cert.description}
              </p>

              {/* Skill tags */}
              <div className="flex flex-wrap gap-1.5">
                {cert.skills.map((skill) => (
                  <span key={skill} className="tag">
                    {skill}
                  </span>
                ))}
              </div>

              {/* Hover glow */}
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
