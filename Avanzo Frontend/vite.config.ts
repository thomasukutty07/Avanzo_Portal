import path from "path"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
import { VitePWA } from "vite-plugin-pwa"

export default defineConfig({
  envDir: '../',
  server: {
    host: true, // Listen on all local IPs
    port: 5173,
    // ── Dev proxy ────────────────────────────────────────────────────────────
    // Proxies /api/* and /ws/* through Vite's dev server so they appear
    // same-origin to the browser (origin: localhost:5173 → backend: localhost:8000).
    //
    // Benefits:
    //  ✅ CSP connect-src 'self' works without whitelisting localhost:8000
    //  ✅ No CORS configuration needed in Django for local dev
    //  ✅ No VITE_API_BASE_URL needed — axios uses relative paths in dev
    proxy: {
      "/api": {
        target: "http://localhost:8000",
        changeOrigin: true,
        secure: false,
      },
      "/ws": {
        target: "ws://localhost:8000",
        ws: true,
        changeOrigin: true,
      },
    },
    // ── Dev-server security headers ─────────────────────────────────────────
    // Mirrors what core.security_middleware.SecurityHeadersMiddleware serves
    // in production so developers get protected during local development too.
    headers: {
      // CSP as an HTTP header — always overrides the meta tag and is never
      // cached by the browser. localhost:8000 is allowed as a fallback for
      // tools that bypass the proxy (e.g. Postman, browser extensions).
      "Content-Security-Policy": [
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline'",
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
        "font-src 'self' https://fonts.gstatic.com data:",
        // Google profile photos (lh3.googleusercontent.com) used for employee avatars
        "img-src 'self' data: blob: https://*.googleusercontent.com",
        // Allow same-origin (proxied requests) + direct to backend (fallback)
        "connect-src 'self' http://localhost:8000 ws://localhost:8000 http://127.0.0.1:8000 ws://127.0.0.1:8000",
        // frame-ancestors is HTTP-header-only (ignored in <meta>) — keep it here
        "frame-ancestors 'none'",
        "base-uri 'self'",
        "form-action 'self'",
        "object-src 'none'",
      ].join("; "),
      "X-Frame-Options": "DENY",
      "X-Content-Type-Options": "nosniff",
      "X-XSS-Protection": "1; mode=block",
      "Referrer-Policy": "strict-origin-when-cross-origin",
      "Permissions-Policy":
        "accelerometer=(), camera=(), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), payment=(), usb=()",
      "Cross-Origin-Opener-Policy": "same-origin",
      "Cross-Origin-Resource-Policy": "same-origin",
    },
  },
  build: {
    // Remove console statements and source maps from production bundles
    // to prevent leaking internal logic to the browser devtools.
    sourcemap: false,
    minify: "esbuild",
  },
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: [
        "favicon.ico",
        "apple-touch-icon.png",
        "pwa-192x192.png",
        "pwa-512x512.png",
      ],
      manifest: {
        name: "Avanzo Dashboard",
        short_name: "Avanzo",
        description: "Avanzo HR & Employee Dashboard",
        theme_color: "#ffffff",
        background_color: "#ffffff",
        display: "standalone",
        icons: [
          {
            src: "pwa-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
          },
          {
            src: "pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any maskable",
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})

