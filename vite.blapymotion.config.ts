import { defineConfig } from 'vite';
import { resolve } from 'node:path';
import { readFileSync } from 'node:fs';
import banner from 'vite-plugin-banner';

const pkg = JSON.parse(readFileSync('./package.json', 'utf-8'));
const year = new Date().getFullYear();

const copyright = `
/**
 * -----------------------------------------------------------------------------------------
 * INTERSEL - 4 cité d'Hauteville - 75010 PARIS
 * RCS PARIS 488 379 660 - NAF 721Z
 *
 * File : BlapyMotion
 * Optional animation module for Blapy (standalone browser build).
 * Load with <script src="dist/BlapyMotion.js"> to enable data-blapy-update="fadeInOut"/"rightOutIn".
 *
 * -----------------------------------------------------------------------------------------
 * @copyright Intersel 2015-${year}
 * @see {@link https://github.com/intersel/blapy2}
 * @version ${pkg.version}
 * @license DonationWare - see https://github.com/intersel/blapy2/blob/master/LICENSE
 * -----------------------------------------------------------------------------------------
 */
`.trim();

// Separate build: emits dist/BlapyMotion.js, a standalone script that registers
// the global `Blapymotion` class. Kept out of the main bundle so animations stay
// fully optional. `emptyOutDir: false` so it doesn't wipe the main build output.
export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/blapymotion-entry.ts'),
      name: 'BlapyMotionBundle',
      fileName: () => 'BlapyMotion.js',
      formats: ['iife'],
    },
    outDir: 'dist',
    emptyOutDir: false,
  },
  plugins: [banner(copyright)],
});