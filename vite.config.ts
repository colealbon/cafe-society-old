import { defineConfig } from 'vite';
import solidPlugin from 'vite-plugin-solid';
import eslint from 'vite-plugin-eslint';
import basicSsl from '@vitejs/plugin-basic-ssl'
// yarn add --dev @esbuild-plugins/node-modules-polyfill
// import { NodeModulesPolyfillPlugin } from '@esbuild-plugins/node-modules-polyfill'
// import { NodeGlobalsPolyfillPlugin } from '@esbuild-plugins/node-globals-polyfill'
// You don't need to add this to deps, it's included by @esbuild-plugins/node-modules-polyfill
// import rollupNodePolyFill from 'rollup-plugin-node-polyfills'

export default defineConfig({
  plugins: [
    solidPlugin(),
    eslint(),
    basicSsl()
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

