/**
 * -----------------------------------------------------------------------------------------
 * INTERSEL - 4 cité d'Hauteville - 75010 PARIS
 * RCS PARIS 488 379 660 - NAF 721Z
 *
 * File : BlapySocket.js
 * BlapySocket : WebSocket service for real-time communication in Blapy V2 (Receive Only)
 *
 * -----------------------------------------------------------------------------------------
 * @copyright Intersel 2015-2025
 * @fileoverview WebSocket service for Blapy V2 - handles incoming real-time commands
 *               and remote block updates. This version only receives messages.
 * @see {@link https://github.com/intersel/blapy2}
 * @author Corentin NELHOMME - corentin.nelhomme@intersel.fr
 * @version 1.0.0
 * @license DonationWare - see https://github.com/intersel/blapy2/blob/master/LICENSE
 * -----------------------------------------------------------------------------------------
 */

class BlapySocket {

  /**
   * Initialize the WebSocket service for Blapy (Receive Only).
   *
   * @constructor
   * @param {Object} [options={}] - Configuration options for the WebSocket service.
   * @param blapy
   * @param {string} [options.url='ws://localhost:8080'] - WebSocket server URL.
   * @param {boolean} [options.autoConnect=false] - Auto-connect on instantiation.
   * @param {number} [options.reconnectDelay=3000] - Delay between reconnection attempts (ms).
   * @param {number} [options.maxReconnectAttempts=10] - Maximum number of reconnection attempts.
   * @param {boolean} [options.debug=false] - Enable debug logging.
   * @param {Array<string>} [options.allowedCommands] - List of allowed remote commands.
   * @param {Object} [options.auth] - Authentication data to send on connection.
   * @param {string} [options.clientId] - Unique client identifier.
   */
  constructor(options = {}, blapy) {
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

    this.ws = null
    this.isConnected = false
    this.reconnectAttempts = 0
    this.reconnectTimer = null
    this.blapy = blapy

    // Event callbacks
    this.callbacks = {
      onOpen: [],
      onClose: [],
      onError: [],
      onMessage: [],
      onReconnect: [],
    }

    if (this.options.autoConnect) {
      this.connect()
    }

    this.blapy.logger.info('BlapySocket initialized (Receive Only)', 'WebSocket')
  }

  connect() {
    return new Promise((resolve, reject) => {
      if (this.isConnected) {
        this.blapy.logger.warn("deja co")
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
        this.blapy.logger.error(`Failed to create WebSocket connection: ${error.message}`, 'WebSocket')
        reject(error)
      }
    })
  }

  /**
   * Disconnect from the WebSocket server.
   *
   * @param {number} [code=1000] - Close code.
   * @param {string} [reason='Client disconnect'] - Close reason.
   */
  disconnect(code = 1000, reason = 'Client disconnect') {
    this._clearReconnectTimer()

    if (this.ws && this.isConnected) {
      //this.blapy.logger.info('Disconnecting from WebSocket', 'WebSocket')
      this.ws.close(code, reason)
    }

    this.isConnected = false
    this.ws = null
  }

  /**
   * Add event listener for WebSocket events.
   *
   * @param {string} event - Event name (onOpen, onClose, onError, onMessage, onReconnect).
   * @param {Function} callback - Callback function.
   */
  on(event, callback) {
    if (this.callbacks[event]) {
      this.callbacks[event].push(callback)
    } else {
      this.blapy.logger.warn(`Unknown event: ${event}`, 'WebSocket')
    }
  }

  /**
   * Remove event listener.
   *
   * @param {string} event - Event name.
   * @param {Function} callback - Callback function to remove.
   */
  off(event, callback) {
    if (this.callbacks[event]) {
      const index = this.callbacks[event].indexOf(callback)
      if (index > -1) {
        this.callbacks[event].splice(index, 1)
      }
    }
  }

  /**
   * Get connection status.
   *
   * @returns {Object} Connection status information.
   */
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
   *
   * @private
   */
  _sendIdentification() {
    if (this.ws && this.isConnected) {
      const identMessage = {
        type: 'identify',
        clientId: this.options.clientId,
        blapyInstance: this.blapy?.myUIObjectID || 'unknown',
        timestamp: Date.now()
      }

      if (this.options.auth) {
        identMessage.auth = this.options.auth
      }

      try {
        this.ws.send(JSON.stringify(identMessage))
      } catch (error) {
        this.blapy.logger.error(`Error sending identification: ${error.message}`, 'WebSocket')
      }
    }
  }

  /**
   * Handle incoming WebSocket messages.
   *
   * @private
   * @param {MessageEvent} event - WebSocket message event.
   */
  _handleMessage(event) {
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
      this.blapy.logger.error(`Error parsing message: ${error.message}`, 'WebSocket')
    }
  }

  /**
   * Handle Blapy commands received via WebSocket.
   *
   * @private
   * @param {Object} message - The command message.
   */
  _handleBlapyCommand(message) {
    if (!this.blapy) {
      this.blapy.logger.error('No Blapy instance attached, cannot execute command', 'WebSocket')
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
      this.blapy.logger.error(error)
      this.blapy.logger.error(`Error executing command: ${error.message}`, 'WebSocket')
    }
  }

  /**
   * Handle broadcast messages.
   *
   * @private
   * @param {Object} message - The broadcast message.
   */
  _handleBroadcast(message) {
    // Trigger custom event for broadcast
    if (this.blapy) {
      this.blapy.trigger('BlapySocket_Broadcast', message.data)
    }
  }

  /**
   * Schedule reconnection attempt.
   *
   * @private
   */
  _scheduleReconnect() {
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
        this.blapy.logger.error(`Reconnection attempt ${this.reconnectAttempts} failed: ${error.message}`, 'WebSocket')
      })
    }, delay)
  }

  /**
   * Clear reconnection timer.
   *
   * @private
   */
  _clearReconnectTimer() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }
  }

  /**
   * Trigger event callbacks.
   *
   * @private
   * @param {string} event - Event name.
   * @param {*} data - Event data.
   */
  _triggerCallbacks(event, data) {
    if (this.callbacks[event]) {
      this.callbacks[event].forEach(callback => {
        try {
          callback(data)
        } catch (error) {
          this.blapy.logger.error(`Error in ${event} callback: ${error.message}`, 'WebSocket')
        }
      })
    }
  }

  /**
   * Generate a unique client ID.
   *
   * @private
   * @returns {string} Unique client identifier.
   */
  _generateClientId() {
    return 'blapy_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now()
  }
}