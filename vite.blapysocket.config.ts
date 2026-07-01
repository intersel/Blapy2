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
 * File : BlapySocket
 * Optional WebSocket module for Blapy (standalone browser build, receive-only).
 * Load with <script src="dist/BlapySocket.js"> and pass \`websocketOptions\` to Blapy.
 *
 * -----------------------------------------------------------------------------------------
 * @copyright Intersel 2015-${year}
 * @see {@link https://github.com/intersel/blapy2}
 * @version ${pkg.version}
 * @license DonationWare - see https://github.com/intersel/blapy2/blob/master/LICENSE
 * -----------------------------------------------------------------------------------------
 */
`.trim();

// Separate build: emits dist/BlapySocket.js, a standalone script that registers
// the global `BlapySocket` class. Kept out of the main bundle so WebSocket support
// stays fully optional. `emptyOutDir: false` so it doesn't wipe the main build output.
export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/blapysocket-entry.ts'),
      name: 'BlapySocketBundle',
      fileName: () => 'BlapySocket.js',
      formats: ['iife'],
    },
    outDir: 'dist',
    emptyOutDir: false,
  },
  plugins: [banner(copyright)],
});