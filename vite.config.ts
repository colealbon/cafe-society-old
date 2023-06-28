import { defineConfig } from 'vite';
import solidPlugin from 'vite-plugin-solid';
import eslint from 'vite-plugin-eslint';
import basicSsl from '@vitejs/plugin-basic-ssl'
// yarn add --dev @esbuild-plugins/node-modules-polyfill
import { NodeModulesPolyfillPlugin } from '@esbuild-plugins/node-modules-polyfill'
import { NodeGlobalsPolyfillPlugin } from '@esbuild-plugins/node-globals-polyfill'
// You don't need to add this to deps, it's included by @esbuild-plugins/node-modules-polyfill
import rollupNodePolyFill from 'rollup-plugin-node-polyfills'

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
  resolve: {
    alias: {
        buffer: 'rollup-plugin-node-polyfills/polyfills/buffer-es6',
    }
},
  optimizeDeps: {
    esbuildOptions: {
        // Node.js global to browser globalThis
        define: {
            global: 'globalThis'
        },
        // Enable esbuild polyfill plugins
        plugins: [
            NodeGlobalsPolyfillPlugin({
                process: true,
                buffer: true
            }),
            NodeModulesPolyfillPlugin()
        ]
    }
},
  build: {
    target: 'esnext',
    rollupOptions: {
      plugins: [
          // Enable rollup polyfills plugin
          // used during production bundling
          rollupNodePolyFill()
      ]
    }
  },
});

