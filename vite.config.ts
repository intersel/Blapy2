import { defineConfig } from 'vitest/config';
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
 * File : blapy
 * Klapy runtime (modern TypeScript build, no jQuery).
 *
 * -----------------------------------------------------------------------------------------
 * @copyright Intersel 2015-${year}
 * @see {@link https://github.com/intersel/blapy2}
 * @version ${pkg.version}
 * @license DonationWare - see https://github.com/intersel/blapy2/blob/master/LICENSE
 * -----------------------------------------------------------------------------------------
 */
`.trim();

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/main.ts'),
      name: 'Klapy',
      fileName: 'blapy',
      formats: ['es', 'umd'],
    },
    outDir: 'dist',
    emptyOutDir: true,
  },
  plugins: [banner(copyright)],
  test: {
    environment: 'jsdom',
    exclude: ['tests/e2e/**', 'node_modules/**', 'Blapy2/**', '**/Blapy2/**'],
  },
});