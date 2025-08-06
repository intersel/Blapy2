import { defineConfig } from 'vite'
import path from 'path'
import fs from 'fs'
import banner from 'vite-plugin-banner'

const pkg = JSON.parse(fs.readFileSync('./package.json', 'utf-8'))

const currentYear = new Date().getFullYear()
const version = pkg.version
const outputFile = 'blapy2.js'

const blapyBanner = `
/**
 * -----------------------------------------------------------------------------------------
 * INTERSEL - 4 cité d'Hauteville - 75010 PARIS
 * RCS PARIS 488 379 660 - NAF 721Z
 *
 * File : ${outputFile}
 * Blapy2 runtime for browser usage, including Blapy V1 compatibility.
 *
 * -----------------------------------------------------------------------------------------
 * @copyright Intersel 2015-${currentYear}
 * @fileoverview Blapy2 runtime for browser usage, including Blapy V1 compatibility.
 * @see {@link https://github.com/intersel/blapy2}
 * @author Corentin NELHOMME - corentin.nelhomme@intersel.fr
 * @version ${version}
 * @license DonationWare - see https://github.com/intersel/blapy2/blob/master/LICENSE
 * -----------------------------------------------------------------------------------------
 */
`.trim()

export default defineConfig({
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/browser-entry.js'),
      name: 'Blapy2',
      fileName: () => outputFile,
      formats: ['iife'],
    },
    outDir: 'dist',
    emptyOutDir: true,
    minify: 'terser',
    terserOptions: {
      format: {
        comments: false,
      },
    },
    rollupOptions: {
      external: [],
    },
  },
  test: {
    environment: 'jsdom'
  },
  plugins: [
    banner(blapyBanner),
  ],
})
