/** @type {import('next').NextConfig} */
const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), browsing-topics=()",
  },
];

const nextConfig = {
  poweredByHeader: false,
  async headers() {
    return [
      { source: "/(.*)", headers: securityHeaders },
      {
        source: "/mohd-zamin-quadri-resume.pdf",
        headers: [
          { key: "Content-Disposition", value: 'attachment; filename="mohd-zamin-quadri-resume.pdf"' },
          { key: "Cache-Control", value: "public, max-age=0, must-revalidate" },
        ],
      },
    ];
  },
};

export default nextConfig;
