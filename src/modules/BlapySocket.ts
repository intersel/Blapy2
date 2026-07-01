/**
 * -----------------------------------------------------------------------------------------
 * INTERSEL - 4 cité d'Hauteville - 75010 PARIS
 * RCS PARIS 488 379 660 - NAF 721Z
 *
 * File : BlapySocket.ts
 * BlapySocket : WebSocket service for real-time communication in Blapy V2 (Receive Only)
 *
 * -----------------------------------------------------------------------------------------
 * @copyright Intersel 2015-2026
 * @fileoverview WebSocket service for Blapy V2 - handles incoming real-time commands
 *               and remote block updates. This version only receives messages.
 * @see {@link https://github.com/intersel/blapy2}
 * @author Corentin NELHOMME - corentin.nelhomme@intersel.fr
 * @version 1.0.0
 * @license DonationWare - see https://github.com/intersel/blapy2/blob/master/LICENSE
 * -----------------------------------------------------------------------------------------
 */

import type { Blapy } from '../core/Blapy'
import type { BlapySocketOptions } from '#shared/types'

/** Names of the lifecycle events consumers can subscribe to via `on()`/`off()`. */
export type BlapySocketEvent = 'onOpen' | 'onClose' | 'onError' | 'onMessage' | 'onReconnect'

type BlapySocketCallback = (data: unknown) => void

/** Shape of a command message received from the server. */
interface BlapyCommandMessage {
  type: string
  command: string
  data: any
}

class BlapySocket {

  private readonly options: Required<BlapySocketOptions>
  private ws: WebSocket | null = null
  private isConnected = false
  private reconnectAttempts = 0
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null
  private readonly blapy: Blapy
  private readonly callbacks: Record<BlapySocketEvent, BlapySocketCallback[]> = {
    onOpen: [],
    onClose: [],
    onError: [],
    onMessage: [],
    onReconnect: [],
  }

  /**
   * Initialize the WebSocket service for Blapy (Receive Only).
   *
   * @param options - Configuration options for the WebSocket service.
   * @param blapy   - The owning Blapy instance (used for logging and command dispatch).
   */
  constructor(options: BlapySocketOptions = {}, blapy: Blapy) {
    this.blapy = blapy
    this.options = {
      url: 'ws://localhost:8080',
      autoConnect: false,
      reconnectDelay: 3000,
      maxReconnectAttempts: 10,
      allowedCommands: ['postData', 'updateBlock', 'reloadBlock', 'loadUrl', 'trigger'],
      auth: null,
      clientId: this._generateClientId(),
      ...options,
    }

    if (this.options.autoConnect) {
      this.connect()
    }

    this.blapy.logger.info('BlapySocket initialized (Receive Only)', 'WebSocket')
  }

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.isConnected) {
        this.blapy.logger.warn('Already connected to WebSocket', 'WebSocket')
        resolve()
        return
      }

      this.blapy.logger.info(`Connecting to WebSocket: ${this.options.url}`, 'WebSocket')

      try {
        this.ws = new WebSocket(this.options.url)

        this.ws.onopen = (event) => {
          this.isConnected = true
          this.reconnectAttempts = 0
          this._clearReconnectTimer()

          this._sendIdentification()

          this._triggerCallbacks('onOpen', event)
          resolve()
        }

        this.ws.onclose = (event) => {
          this.isConnected = false
          this.blapy.logger.warn(`WebSocket closed: ${event.code} - ${event.reason}`, 'WebSocket')

          this._triggerCallbacks('onClose', event)

          // Attempt reconnection if not a clean close
          if (event.code !== 1000 && this.reconnectAttempts < this.options.maxReconnectAttempts) {
            this._scheduleReconnect()
          }
        }

        this.ws.onerror = (event) => {
          this.blapy.logger.error('WebSocket error occurred', 'WebSocket')
          this._triggerCallbacks('onError', event)

          if (!this.isConnected) {
            reject(new Error('Failed to connect to WebSocket'))
          }
        }

        this.ws.onmessage = (event) => {
          this._handleMessage(event)
        }

      } catch (error) {
        this.blapy.logger.error(`Failed to create WebSocket connection: ${this._errorMessage(error)}`, 'WebSocket')
        reject(error instanceof Error ? error : new Error(String(error)))
      }
    })
  }

  /**
   * Disconnect from the WebSocket server.
   *
   * @param code   - Close code.
   * @param reason - Close reason.
   */
  disconnect(code = 1000, reason = 'Client disconnect') {
    this._clearReconnectTimer()

    if (this.ws && this.isConnected) {
      this.ws.close(code, reason)
    }

    this.isConnected = false
    this.ws = null
  }

  /**
   * Add an event listener for WebSocket events.
   *
   * @param event    - Event name (onOpen, onClose, onError, onMessage, onReconnect).
   * @param callback - Callback function.
   */
  on(event: BlapySocketEvent, callback: BlapySocketCallback) {
    if (this.callbacks[event]) {
      this.callbacks[event].push(callback)
    } else {
      this.blapy.logger.warn(`Unknown event: ${event}`, 'WebSocket')
    }
  }

  /**
   * Remove an event listener.
   *
   * @param event    - Event name.
   * @param callback - Callback function to remove.
   */
  off(event: BlapySocketEvent, callback: BlapySocketCallback) {
    if (this.callbacks[event]) {
      const index = this.callbacks[event].indexOf(callback)
      if (index > -1) {
        this.callbacks[event].splice(index, 1)
      }
    }
  }

  /** Get connection status information. */
  getStatus() {
    return {
      connected: this.isConnected,
      url: this.options.url,
      clientId: this.options.clientId,
      reconnectAttempts: this.reconnectAttempts,
    }
  }

  /**
   * Send identification message only (minimal sending).
   * @private
   */
  private _sendIdentification() {
    if (this.ws && this.isConnected) {
      const identMessage: Record<string, unknown> = {
        type: 'identify',
        clientId: this.options.clientId,
        blapyInstance: this.blapy?.myUIObjectID || 'unknown',
        timestamp: Date.now(),
      }

      if (this.options.auth) {
        identMessage.auth = this.options.auth
      }

      try {
        this.ws.send(JSON.stringify(identMessage))
      } catch (error) {
        this.blapy.logger.error(`Error sending identification: ${this._errorMessage(error)}`, 'WebSocket')
      }
    }
  }

  /**
   * Handle incoming WebSocket messages.
   * @private
   */
  private _handleMessage(event: MessageEvent) {
    try {
      const message = JSON.parse(event.data)

      switch (message.type) {
        case 'blapy_command':
          this._handleBlapyCommand(message)
          break

        case 'broadcast':
          this._handleBroadcast(message)
          break

        default:
          this.blapy.logger.info(`Unhandled message type: ${message.type}`, 'WebSocket')
      }

      // Trigger message callbacks
      this._triggerCallbacks('onMessage', message)

    } catch (error) {
      this.blapy.logger.error(`Error parsing message: ${this._errorMessage(error)}`, 'WebSocket')
    }
  }

  /**
   * Handle Blapy commands received via WebSocket.
   * @private
   */
  private _handleBlapyCommand(message: BlapyCommandMessage) {
    if (!this.blapy) {
      return
    }

    const { command, data } = message

    // Security check
    if (!this.options.allowedCommands.includes(command)) {
      this.blapy.logger.warn(`Command not allowed: ${command}`, 'WebSocket')
      return
    }

    try {
      switch (command) {
        case 'postData':
          this.blapy.myFSM.trigger('postData', data)
          break

        case 'updateBlock':
          this.blapy.myFSM.trigger('updateBlock', data)
          break

        case 'reloadBlock':
          this.blapy.myFSM.trigger('reloadBlock', data)
          break

        case 'loadUrl':
          this.blapy.myFSM.trigger('loadUrl', data)
          break

        case 'trigger':
          if (data.event && this.blapy.trigger) {
            this.blapy.trigger(data.event, data.payload)
          }
          break

        default:
          this.blapy.logger.warn(`Unknown Blapy command: ${command}`, 'WebSocket')
      }
    } catch (error) {
      this.blapy.logger.error(`Error executing command: ${this._errorMessage(error)}`, 'WebSocket')
    }
  }

  /**
   * Handle broadcast messages.
   * @private
   */
  private _handleBroadcast(message: { data: unknown }) {
    if (this.blapy) {
      this.blapy.trigger('BlapySocket_Broadcast', message.data)
    }
  }

  /**
   * Schedule a reconnection attempt.
   * @private
   */
  private _scheduleReconnect() {
    if (this.reconnectTimer) return

    this.reconnectAttempts++
    const delay = this.options.reconnectDelay * Math.pow(1.5, this.reconnectAttempts - 1)

    this.blapy.logger.info(`Scheduling reconnection attempt ${this.reconnectAttempts} in ${delay}ms`, 'WebSocket')

    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null
      this.blapy.logger.info(`Reconnection attempt ${this.reconnectAttempts}`, 'WebSocket')

      this.connect().then(() => {
        this._triggerCallbacks('onReconnect', { attempt: this.reconnectAttempts })
      }).catch((error) => {
        this.blapy.logger.error(`Reconnection attempt ${this.reconnectAttempts} failed: ${this._errorMessage(error)}`, 'WebSocket')
      })
    }, delay)
  }

  /**
   * Clear the reconnection timer.
   * @private
   */
  private _clearReconnectTimer() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }
  }

  /**
   * Trigger event callbacks.
   * @private
   */
  private _triggerCallbacks(event: BlapySocketEvent, data: unknown) {
    if (this.callbacks[event]) {
      this.callbacks[event].forEach((callback) => {
        try {
          callback(data)
        } catch (error) {
          this.blapy.logger.error(`Error in ${event} callback: ${this._errorMessage(error)}`, 'WebSocket')
        }
      })
    }
  }

  /**
   * Generate a unique client ID.
   * @private
   */
  private _generateClientId(): string {
    return 'blapy_' + Math.random().toString(36).slice(2, 11) + '_' + Date.now()
  }

  private _errorMessage(error: unknown): string {
    return error instanceof Error ? error.message : String(error)
  }
}

export default BlapySocket