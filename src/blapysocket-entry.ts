// Standalone browser build entry for the optional WebSocket module.
// Loading `<script src="dist/BlapySocket.js">` exposes the `BlapySocket` class
// as a global, which Blapy auto-detects when `websocketOptions` is provided.
import BlapySocket from './modules/BlapySocket'

;(globalThis as unknown as { BlapySocket: typeof BlapySocket }).BlapySocket = BlapySocket

export default BlapySocket