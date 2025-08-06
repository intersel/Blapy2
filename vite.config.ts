import { defineConfig } from 'vite'
import path from 'path'
import fs from 'fs'
import banner from 'vite-plugin-banner'

const pkg = JSON.parse(fs.readFileSync('./package.json', 'utf-8'))

const currentYear = new Date().getFullYear()
const version = pkg.version

const builds = [
  {
    entry: 'src/browser-entry.js',
    fileName: 'blapy2.js',
    name: 'Blapy2',
    description: 'Blapy2 runtime for browser usage, including Blapy V1 compatibility.'
  },
  {
    entry: 'src/modules/Blapymotion.js',
    fileName: 'Blapymotion.js',
    name: 'Blapymotion',
    description: 'Blapy2 Animation module for browser usage.'
  },
  {
    entry: 'src/modules/BlapySocket.js',
    fileName: 'BlapySocket.js',
    name: 'BlapySocket',
    description: 'Blapy2 Socket module for browser usage.'
  }
]

const createBanner = (config) => `
/**
 * -----------------------------------------------------------------------------------------
 * INTERSEL - 4 cité d'Hauteville - 75010 PARIS
 * RCS PARIS 488 379 660 - NAF 721Z
 *
 * File : ${config.fileName}
 * ${config.description}
 *
 * -----------------------------------------------------------------------------------------
 * @copyright Intersel 2015-${currentYear}
 * @fileoverview ${config.description}
 * @see {@link https://github.com/intersel/blapy2}
 * @author Corentin NELHOMME - corentin.nelhomme@intersel.fr
 * @version ${version}
 * @license DonationWare - see https://github.com/intersel/blapy2/blob/master/LICENSE
 * -----------------------------------------------------------------------------------------
 */
`.trim()

const defaultBuild = builds[0]

export default defineConfig({
  build: {
    lib: {
      entry: path.resolve(__dirname, defaultBuild.entry),
      name: defaultBuild.name,
      fileName: () => defaultBuild.fileName,
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
    banner(createBanner(defaultBuild)),
    {
      name: 'multiple-builds',
      closeBundle: async () => {
        if (process.env.NODE_ENV === 'production') {
          const { build } = await import('vite')
          
          for (let i = 1; i < builds.length; i++) {
            const buildConfig = builds[i]
            
            await build({
              configFile: false,
              build: {
                lib: {
                  entry: path.resolve(process.cwd(), buildConfig.entry),
                  name: buildConfig.name,
                  fileName: () => buildConfig.fileName,
                  formats: ['iife'],
                },
                outDir: 'dist',
                emptyOutDir: false,
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
              plugins: [
                banner(createBanner(buildConfig)),
              ],
            })
          }
        }
      }
    }
  ],
})