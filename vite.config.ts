import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Fixed ports (Vite's 5173/4173 defaults are taken by other local apps). strictPort fails loudly
  // instead of silently moving to the next free port.
  server: { port: 5180, strictPort: true },
  preview: { port: 4180, strictPort: true },
});
