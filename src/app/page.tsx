import dynamic from "next/dynamic";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import About from "@/components/About";
import Experience from "@/components/Experience";
import Projects from "@/components/Projects";
import Skills from "@/components/Skills";
import Education from "@/components/Education";
import Certifications from "@/components/Certifications";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";

// Dynamic imports for client-only components
const ScrollAnimationManager = dynamic(
  () => import("@/components/ScrollAnimations"),
  { ssr: false }
);
const FloatingElements = dynamic(
  () => import("@/components/FloatingElements"),
  { ssr: false }
);

export default function Home() {
  return (
    <main className="relative min-h-screen bg-dark-950">
      <Navbar />
      <ScrollAnimationManager />
      <Hero />
      <FloatingElements variant="a" className="floating-divider" />
      <About />
      <FloatingElements variant="b" className="floating-divider" />
      <Experience />
      <FloatingElements variant="c" className="floating-divider" />
      <Projects />
      <FloatingElements variant="a" className="floating-divider" />
      <Skills />
      <FloatingElements variant="b" className="floating-divider" />
      <Education />
      <FloatingElements variant="c" className="floating-divider" />
      <Certifications />
      <FloatingElements variant="a" className="floating-divider" />
      <Contact />
      <Footer />
    </main>
  );
}
