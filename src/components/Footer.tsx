export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative border-t border-emerald-500/10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <span className="font-display text-lg font-bold text-white">
              ZQ
            </span>
            <span className="font-display text-lg font-bold text-emerald-500">
              .
            </span>
            <span className="text-sm text-dark-500 ml-2">
              Mohd Zamin Quadri
            </span>
          </div>

          {/* Links */}
          <div className="flex items-center gap-6">
            <a
              href="https://github.com/mzquadri"
              target="_blank"
              rel="noopener noreferrer"
              className="text-dark-500 hover:text-emerald-400 transition-colors text-sm"
            >
              GitHub
            </a>
            <a
              href="https://www.linkedin.com/in/mohd-zamin/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-dark-500 hover:text-emerald-400 transition-colors text-sm"
            >
              LinkedIn
            </a>
            <a
              href="mailto:zamin.quadri@tum.de"
              className="text-dark-500 hover:text-emerald-400 transition-colors text-sm"
            >
              Email
            </a>
          </div>

          {/* Copyright */}
          <div className="text-center md:text-right">
            <p className="font-mono text-xs text-dark-600">
              &copy; {currentYear} Mohd Zamin Quadri. All rights reserved.
            </p>
            <p className="font-mono text-[10px] text-dark-700 mt-1">
              Built with Next.js, React Three Fiber & Tailwind CSS
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
