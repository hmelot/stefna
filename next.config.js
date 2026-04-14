/** @type {import('next').NextConfig} */
const nextConfig = {
  // Removed output: 'export' to enable SSR for /dashboard and /admin routes.
  // Static pages (landing, rubro pages, legal) are still statically generated.
  // Dynamic pages use server-side rendering via Cloudflare Workers.
}
module.exports = nextConfig
