import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
  target: 'https://americanrentacar.ar',
        changeOrigin: true,
        secure: true
      },
      '/backend': {
  target: 'https://americanrentacar.ar',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/backend/, '/api')
      }
    }
  },
  build: {
    rollupOptions: {
      input: 'src/widget.jsx',
      output: {
        entryFileNames: 'widget.js',
        chunkFileNames: 'widget.[name].js',
        assetFileNames: ({name}) => {
          if (name && name.endsWith('.css')) return 'widget.css';
          return 'assets/[name][extname]';
        }
      }
    }
  },
  optimizeDeps: {}
});