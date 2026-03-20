"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const navLinks = [
  { label: "About", href: "#about" },
  { label: "Experience", href: "#experience" },
  { label: "Projects", href: "#projects" },
  { label: "Skills", href: "#skills" },
  { label: "Education", href: "#education" },
  { label: "Contact", href: "#contact" },
];

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("");

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);

      // Determine active section
      const sections = navLinks.map((l) => l.href.slice(1));
      for (let i = sections.length - 1; i >= 0; i--) {
        const el = document.getElementById(sections[i]);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 150) {
            setActiveSection(sections[i]);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleNavClick = (href: string) => {
    setIsMobileOpen(false);
    const el = document.querySelector(href);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={`glass-nav transition-all duration-300 ${
        isScrolled ? "py-3" : "py-4"
      }`}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Logo */}
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          className="relative group"
        >
          <span className="font-display text-xl font-bold tracking-wider text-white">
            ZQ
          </span>
          <span className="font-display text-xl font-bold text-emerald-500">
            .
          </span>
          <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-emerald-500 group-hover:w-full transition-all duration-300" />
        </a>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <button
              key={link.href}
              onClick={() => handleNavClick(link.href)}
              className={`relative px-4 py-2 text-sm font-medium transition-colors duration-300 rounded-lg ${
                activeSection === link.href.slice(1)
                  ? "text-emerald-400"
                  : "text-dark-400 hover:text-white"
              }`}
            >
              {link.label}
              {activeSection === link.href.slice(1) && (
                <motion.span
                  layoutId="activeNav"
                  className="absolute inset-0 rounded-lg bg-emerald-500/10 border border-emerald-500/20"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
            </button>
          ))}
          <a
            href="/Mohd_Zamin_CV.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="ml-4 btn-outline text-xs py-2 px-4"
          >
            Resume
          </a>
        </div>

        {/* Mobile toggle */}
        <button
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="md:hidden relative w-8 h-8 flex flex-col items-center justify-center gap-1.5"
          aria-label="Toggle menu"
        >
          <motion.span
            animate={{
              rotate: isMobileOpen ? 45 : 0,
              y: isMobileOpen ? 6 : 0,
            }}
            className="w-6 h-0.5 bg-white block"
          />
          <motion.span
            animate={{ opacity: isMobileOpen ? 0 : 1 }}
            className="w-6 h-0.5 bg-white block"
          />
          <motion.span
            animate={{
              rotate: isMobileOpen ? -45 : 0,
              y: isMobileOpen ? -6 : 0,
            }}
            className="w-6 h-0.5 bg-white block"
          />
        </button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden overflow-hidden border-t border-emerald-500/10"
          >
            <div className="px-4 py-4 space-y-1">
              {navLinks.map((link, i) => (
                <motion.button
                  key={link.href}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => handleNavClick(link.href)}
                  className={`block w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                    activeSection === link.href.slice(1)
                      ? "text-emerald-400 bg-emerald-500/10"
                      : "text-dark-400 hover:text-white hover:bg-dark-800"
                  }`}
                >
                  {link.label}
                </motion.button>
              ))}
              <a
                href="/Mohd_Zamin_CV.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="block text-center mt-4 btn-outline text-xs py-2.5"
              >
                Resume
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
