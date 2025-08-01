import { defineConfig } from 'vite'
import path from 'path'

export default defineConfig({
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/browser-entry.js'),
      name: 'Blapy2',
      fileName: () => 'blapy2.js',
      formats: ['iife'],
    },
    outDir: 'dist',
    emptyOutDir: true,
    minify: 'terser', // obligatoire pour terserOptions
    terserOptions: {
      format: {
        comments: false, // ⛔️ supprime tous les commentaires
      },
    },
    rollupOptions: {
      external: [],
    },
  },
})
