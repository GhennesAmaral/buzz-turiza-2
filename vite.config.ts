import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path, { dirname } from "path";
import { fileURLToPath } from "url";
import glsl from "vite-plugin-glsl";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig({
  plugins: [
    react(),
    glsl(), // Add GLSL shader support for advanced graphics
  ],
  base: "/", // Ensure correct base path for Vercel
  publicDir: "public", // Explicitly set public directory
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
      "@components": path.resolve(__dirname, "src/components"),
      "@lib": path.resolve(__dirname, "src/lib"),
      "@hooks": path.resolve(__dirname, "src/hooks"),
      "@types": path.resolve(__dirname, "src/types"),
      "@assets": path.resolve(__dirname, "src/assets"),
      "@utils": path.resolve(__dirname, "src/utils"),
    },
  },
  build: {
    outDir: "dist",
    emptyOutDir: true,
    sourcemap: false, // Disable sourcemaps for production
    minify: "terser", // Use terser for better minification
    target: "es2015", // Support older browsers
    // Optimize for games and Vercel deployment
    rollupOptions: {
      output: {
        manualChunks: {
          // Separate Three.js and game libraries for better caching
          'three': ['three'],
          'react-three': ['@react-three/fiber', '@react-three/drei', '@react-three/postprocessing'],
          'game-engines': ['pixi.js', 'matter-js', 'ogl'],
          'animations': ['gsap', 'framer-motion'],
          'audio': ['howler'],
          'ui': ['@radix-ui/react-dialog', '@radix-ui/react-popover', '@radix-ui/react-tooltip'],
        },
        // Optimize file naming for Vercel caching
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]'
      },
    },
  },
  // Support for large game assets
  assetsInclude: [
    "**/*.gltf", 
    "**/*.glb", 
    "**/*.fbx",
    "**/*.obj",
    "**/*.mtl",
    "**/*.mp3", 
    "**/*.ogg", 
    "**/*.wav",
    "**/*.m4a",
    "**/*.hdr",
    "**/*.exr",
    "**/*.glsl",
    "**/*.vert",
    "**/*.frag"
  ],
  server: {
    port: 3000,
    host: true, // Allow external connections for mobile testing
    allowedHosts: [
      '.e2b.app',        // Allow all E2B subdomains
      '*.e2b.app',       // Alternative pattern for E2B subdomains
      '.lasy.ai',        // Allow all Lasy AI subdomains
      '*.lasy.ai',       // Alternative pattern for Lasy AI subdomains
      'localhost',
      '127.0.0.1',
      '0.0.0.0',
      'all',             // Allow all hosts (fallback)
    ],
    cors: {
      origin: [
        'https://lasy.ai',
        'https://app.lasy.ai',
        'https://www.lasy.ai',
        /^https:\/\/.*\.lasy\.ai$/,     // All Lasy subdomains
        /^https:\/\/.*\.e2b\.app$/,     // All E2B subdomains
        'http://localhost:3000',
        'http://127.0.0.1:3000',
      ],
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
    },
    hmr: {
      protocol: 'wss',
      host: '3000-iqefjmmsrpk26gumzchzh.e2b.app',
      port: 443,
      clientPort: 443,
    },
  },
  // Optimize for game development
  optimizeDeps: {
    include: [
      'three',
      '@react-three/fiber',
      '@react-three/drei',
      'gsap',
      'howler',
      'matter-js',
      'pixi.js'
    ],
  },
});
