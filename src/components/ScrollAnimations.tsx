"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/* =============================================
   Scroll Animation Manager
   Handles GSAP ScrollTrigger animations for
   all sections - fade-in, parallax, 3D triggers
   ============================================= */

// Register GSAP plugin
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export function useScrollAnimations() {
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    // Wait for DOM
    const timer = setTimeout(() => {
      // Animate section headers
      gsap.utils.toArray<HTMLElement>(".section-title").forEach((el) => {
        gsap.fromTo(
          el,
          { opacity: 0, y: 60, scale: 0.95 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 1,
            ease: "power3.out",
            scrollTrigger: {
              trigger: el,
              start: "top 85%",
              end: "top 50%",
              toggleActions: "play none none reverse",
            },
          }
        );
      });

      // Animate section subtitles
      gsap.utils.toArray<HTMLElement>(".section-subtitle").forEach((el) => {
        gsap.fromTo(
          el,
          { opacity: 0, y: 40 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            delay: 0.2,
            ease: "power2.out",
            scrollTrigger: {
              trigger: el,
              start: "top 85%",
              toggleActions: "play none none reverse",
            },
          }
        );
      });

      // Animate glass cards with stagger
      gsap.utils.toArray<HTMLElement>(".glass-card").forEach((el, i) => {
        gsap.fromTo(
          el,
          { opacity: 0, y: 50, rotateX: 5 },
          {
            opacity: 1,
            y: 0,
            rotateX: 0,
            duration: 0.8,
            delay: (i % 3) * 0.15,
            ease: "power2.out",
            scrollTrigger: {
              trigger: el,
              start: "top 90%",
              toggleActions: "play none none reverse",
            },
          }
        );
      });

      // Parallax effect for 3D canvases
      gsap.utils.toArray<HTMLElement>(".parallax-3d").forEach((el) => {
        gsap.fromTo(
          el,
          { y: 50 },
          {
            y: -50,
            ease: "none",
            scrollTrigger: {
              trigger: el,
              start: "top bottom",
              end: "bottom top",
              scrub: 1,
            },
          }
        );
      });

      // Scale-in for 3D scene containers
      gsap.utils.toArray<HTMLElement>(".scene-reveal").forEach((el) => {
        gsap.fromTo(
          el,
          { opacity: 0, scale: 0.8 },
          {
            opacity: 1,
            scale: 1,
            duration: 1.2,
            ease: "power3.out",
            scrollTrigger: {
              trigger: el,
              start: "top 80%",
              toggleActions: "play none none reverse",
            },
          }
        );
      });

      // Skill bars animation
      gsap.utils.toArray<HTMLElement>(".skill-bar-fill").forEach((el) => {
        const width = el.getAttribute("data-width") || "0%";
        gsap.fromTo(
          el,
          { width: "0%" },
          {
            width,
            duration: 1.5,
            ease: "power2.out",
            scrollTrigger: {
              trigger: el,
              start: "top 90%",
              toggleActions: "play none none reverse",
            },
          }
        );
      });

      // Timeline entries slide in
      gsap.utils.toArray<HTMLElement>(".timeline-entry").forEach((el, i) => {
        gsap.fromTo(
          el,
          { opacity: 0, x: i % 2 === 0 ? -60 : 60 },
          {
            opacity: 1,
            x: 0,
            duration: 0.8,
            ease: "power2.out",
            scrollTrigger: {
              trigger: el,
              start: "top 85%",
              toggleActions: "play none none reverse",
            },
          }
        );
      });

      // Floating elements parallax (between sections)
      gsap.utils.toArray<HTMLElement>(".floating-divider").forEach((el) => {
        gsap.fromTo(
          el,
          { y: 30, opacity: 0.5 },
          {
            y: -30,
            opacity: 1,
            ease: "none",
            scrollTrigger: {
              trigger: el,
              start: "top bottom",
              end: "bottom top",
              scrub: 2,
            },
          }
        );
      });
    }, 100);

    return () => {
      clearTimeout(timer);
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, []);
}

export default function ScrollAnimationManager() {
  useScrollAnimations();
  return null;
}
