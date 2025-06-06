import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { inject } from '@vercel/analytics';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' && componentTagger(),
    {
      name: 'vercel-analytics',
      transformIndexHtml() {
        return [
          {
            tag: 'script',
            attrs: { type: 'module' },
            children: `import { inject } from '@vercel/analytics'; inject();`
          }
        ];
      }
    }
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
