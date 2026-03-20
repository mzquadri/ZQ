"use client";

import { useRef, useState } from "react";
import { motion, useInView } from "framer-motion";

const contactInfo = [
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
      </svg>
    ),
    label: "Email",
    value: "zamin.quadri@tum.de",
    href: "mailto:zamin.quadri@tum.de",
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
      </svg>
    ),
    label: "Phone",
    value: "+49 174 4920554",
    href: "tel:+491744920554",
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
      </svg>
    ),
    label: "Location",
    value: "Munich, Germany",
    href: "#",
  },
];

const socialLinks = [
  {
    name: "GitHub",
    url: "https://github.com/mzquadri",
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
      </svg>
    ),
  },
  {
    name: "LinkedIn",
    url: "https://www.linkedin.com/in/mohd-zamin/",
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      </svg>
    ),
  },
];

export default function Contact() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [formState, setFormState] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // For now, open mailto link with form data
    const mailtoUrl = `mailto:zamin.quadri@tum.de?subject=${encodeURIComponent(
      formState.subject || "Portfolio Contact"
    )}&body=${encodeURIComponent(
      `From: ${formState.name} (${formState.email})\n\n${formState.message}`
    )}`;
    window.open(mailtoUrl, "_blank");
    setIsSubmitting(false);
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  };

  return (
    <section id="contact" className="relative" ref={ref}>
      <div className="absolute inset-0 glow-center pointer-events-none" />
      <div className="section-container">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="mb-16 text-center"
        >
          <span className="font-mono text-sm text-emerald-500 tracking-wider">
            07 / CONTACT
          </span>
          <h2 className="section-title mt-2">
            <span className="text-white">Get In </span>
            <span className="gradient-text">Touch</span>
          </h2>
          <p className="section-subtitle mt-4 mx-auto">
            Interested in collaborating or have a question? I&apos;d love to
            hear from you. Let&apos;s build something together.
          </p>
          <div className="w-20 h-1 bg-gradient-to-r from-emerald-500 to-transparent rounded-full mt-4 mx-auto" />
        </motion.div>

        <div className="grid lg:grid-cols-5 gap-12 max-w-5xl mx-auto">
          {/* Contact info */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:col-span-2 space-y-8"
          >
            <div className="space-y-6">
              {contactInfo.map((item, i) => (
                <motion.a
                  key={item.label}
                  href={item.href}
                  initial={{ opacity: 0, y: 20 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ delay: 0.3 + i * 0.1 }}
                  className="flex items-center gap-4 group"
                >
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 group-hover:bg-emerald-500/20 group-hover:border-emerald-500/40 transition-all">
                    {item.icon}
                  </div>
                  <div>
                    <span className="block font-mono text-xs text-dark-500 uppercase tracking-wider">
                      {item.label}
                    </span>
                    <span className="text-sm text-dark-200 group-hover:text-emerald-400 transition-colors">
                      {item.value}
                    </span>
                  </div>
                </motion.a>
              ))}
            </div>

            {/* Social links */}
            <div>
              <p className="font-mono text-xs text-dark-500 uppercase tracking-wider mb-4">
                Find me on
              </p>
              <div className="flex gap-3">
                {socialLinks.map((link) => (
                  <a
                    key={link.name}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-lg bg-dark-800 border border-dark-700 flex items-center justify-center text-dark-400 hover:text-emerald-400 hover:border-emerald-500/30 hover:bg-emerald-500/10 transition-all"
                    aria-label={link.name}
                  >
                    {link.icon}
                  </a>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Contact form */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="lg:col-span-3"
          >
            <form onSubmit={handleSubmit} className="glass-card p-6 md:p-8 space-y-5">
              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <label className="block font-mono text-xs text-dark-500 uppercase tracking-wider mb-2">
                    Name
                  </label>
                  <input
                    type="text"
                    required
                    value={formState.name}
                    onChange={(e) =>
                      setFormState({ ...formState, name: e.target.value })
                    }
                    className="w-full px-4 py-3 rounded-lg bg-dark-800/50 border border-dark-700 text-white text-sm placeholder:text-dark-600 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-all"
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <label className="block font-mono text-xs text-dark-500 uppercase tracking-wider mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    required
                    value={formState.email}
                    onChange={(e) =>
                      setFormState({ ...formState, email: e.target.value })
                    }
                    className="w-full px-4 py-3 rounded-lg bg-dark-800/50 border border-dark-700 text-white text-sm placeholder:text-dark-600 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-all"
                    placeholder="your@email.com"
                  />
                </div>
              </div>

              <div>
                <label className="block font-mono text-xs text-dark-500 uppercase tracking-wider mb-2">
                  Subject
                </label>
                <input
                  type="text"
                  value={formState.subject}
                  onChange={(e) =>
                    setFormState({ ...formState, subject: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-lg bg-dark-800/50 border border-dark-700 text-white text-sm placeholder:text-dark-600 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-all"
                  placeholder="What is this about?"
                />
              </div>

              <div>
                <label className="block font-mono text-xs text-dark-500 uppercase tracking-wider mb-2">
                  Message
                </label>
                <textarea
                  required
                  rows={5}
                  value={formState.message}
                  onChange={(e) =>
                    setFormState({ ...formState, message: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-lg bg-dark-800/50 border border-dark-700 text-white text-sm placeholder:text-dark-600 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-all resize-none"
                  placeholder="Your message..."
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-primary w-full justify-center disabled:opacity-50"
              >
                {submitted ? (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Message Sent!
                  </>
                ) : isSubmitting ? (
                  "Sending..."
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                    </svg>
                    Send Message
                  </>
                )}
              </button>
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
