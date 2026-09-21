/** @type {import('next').NextConfig} */
const nextConfig = {
  // Docker needs the standalone server, while Vercel generates its own
  // deployment artifacts. Next.js 16.3 currently fails when both standalone
  // output and Vercel's build adapter are enabled.
  output: process.env.VERCEL ? undefined : "standalone",
  basePath: "/backend",
};

export default nextConfig;
