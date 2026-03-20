import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Orbitron } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
});

const orbitron = Orbitron({
  subsets: ["latin"],
  variable: "--font-orbitron",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Mohd Zamin Quadri | AI Engineer & Data Scientist",
  description:
    "Portfolio of Mohd Zamin Quadri — AI Engineer, Data Scientist, and MSc Mathematics student at TU Munich. Specializing in machine learning, deep learning, NLP, and MLOps.",
  keywords: [
    "Mohd Zamin Quadri",
    "AI Engineer",
    "Data Scientist",
    "Machine Learning",
    "TU Munich",
    "Deep Learning",
    "NLP",
    "MLOps",
    "Portfolio",
  ],
  authors: [{ name: "Mohd Zamin Quadri" }],
  openGraph: {
    title: "Mohd Zamin Quadri | AI Engineer & Data Scientist",
    description:
      "AI Engineer and Data Scientist specializing in ML, DL, NLP, and MLOps. MSc Mathematics @ TU Munich.",
    url: "https://mzquadri.de",
    siteName: "Mohd Zamin Quadri",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Mohd Zamin Quadri | AI Engineer & Data Scientist",
    description:
      "AI Engineer and Data Scientist specializing in ML, DL, NLP, and MLOps.",
  },
  robots: "index, follow",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} ${orbitron.variable} font-sans antialiased`}
      >
        <div className="noise-overlay" aria-hidden="true" />
        {children}
      </body>
    </html>
  );
}
