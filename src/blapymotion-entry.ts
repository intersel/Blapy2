// Standalone browser build entry for the optional animation module.
// Loading `<script src="dist/BlapyMotion.js">` exposes the `Blapymotion` class
// as a global, which Blapy auto-detects at construction time.
import Blapymotion from './modules/BlapyMotion'

;(globalThis as unknown as { Blapymotion: typeof Blapymotion }).Blapymotion = Blapymotion

export default Blapymotion