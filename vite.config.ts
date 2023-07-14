import { defineConfig } from 'vite';
import solidPlugin from 'vite-plugin-solid';
import eslint from 'vite-plugin-eslint';
import basicSsl from '@vitejs/plugin-basic-ssl'
import UnoCSS from 'unocss/vite'

export default defineConfig({
  plugins: [
    solidPlugin(),
    eslint(),
    basicSsl(),
    UnoCSS(),
  ],
  server: {
    port: 3000,
    host: "localhost",
    strictPort: true
  },
  optimizeDeps: {
    esbuildOptions: {
        // Node.js global to browser globalThis
        define: {
            global: 'globalThis'
        }
    }
},
  build: {
    target: 'esnext'
  },
});

