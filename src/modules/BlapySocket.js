/**
 * -----------------------------------------------------------------------------------------
 * INTERSEL - 4 cité d'Hauteville - 75010 PARIS
 * RCS PARIS 488 379 660 - NAF 721Z
 *
 * File : BlapySocket.js
 * BlapySocket : WebSocket service for real-time communication in Blapy V2
 *
 * -----------------------------------------------------------------------------------------
 * @copyright Intersel 2015-2025
 * @fileoverview WebSocket service for Blapy V2 - handles real-time communication,
 *               remote commands, and bidirectional data exchange.
 * @see {@link https://github.com/intersel/blapy2}
 * @author Corentin NELHOMME - corentin.nelhomme@intersel.fr
 * @version 1.0.0
 * @license DonationWare - see https://github.com/intersel/blapy2/blob/master/LICENSE
 * -----------------------------------------------------------------------------------------
 */

class BlapySocket {

  /**
   * Initialize the WebSocket service for Blapy.
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
    this.messageQueue = []
    this.pendingResponses = new Map()
    this.messageId = 0

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

    this?.blapy?.logger?.info('BlapySocket initialized', 'WebSocket')
  }

  connect() {
    return new Promise((resolve, reject) => {
      if (this.isConnected) {
        this?.blapy?.logger?.warn('Already connected to WebSocket', 'WebSocket')
        resolve()
        return
      }

      this?.blapy?.logger?.info(`Connecting to WebSocket: ${this.options.url}`, 'WebSocket')

      try {
        this.ws = new WebSocket(this.options.url)

        this.ws.onopen = (event) => {
          this.isConnected = true
          this.reconnectAttempts = 0
          this._clearReconnectTimer()

          this?.blapy?.logger?.info('WebSocket connected successfully', 'WebSocket')

          // Send authentication if provided
          if (this.options.auth) {
            this._sendMessage({
              type: 'auth',
              data: this.options.auth,
              clientId: this.options.clientId,
            })
          } else {
            // Send simple identification
            this._sendMessage({
              type: 'identify',
              clientId: this.options.clientId,
              blapyInstance: this.blapy?.myUIObjectID || 'unknown',
            })
          }

          // Send queued messages
          this._flushMessageQueue()

          // Trigger callbacks
          this._triggerCallbacks('onOpen', event)
          resolve()
        }

        this.ws.onclose = (event) => {
          this.isConnected = false
          this?.blapy?.logger?.warn(`WebSocket closed: ${event.code} - ${event.reason}`, 'WebSocket')

          this._triggerCallbacks('onClose', event)

          // Attempt reconnection if not a clean close
          if (event.code !== 1000 && this.reconnectAttempts < this.options.maxReconnectAttempts) {
            this._scheduleReconnect()
          }
        }

        this.ws.onerror = (event) => {
          this?.blapy?.logger?.error('WebSocket error occurred', 'WebSocket')
          this._triggerCallbacks('onError', event)

          if (!this.isConnected) {
            reject(new Error('Failed to connect to WebSocket'))
          }
        }

        this.ws.onmessage = (event) => {
          this._handleMessage(event)
        }

      } catch (error) {
        this?.blapy?.logger?.error(`Failed to create WebSocket connection: ${error.message}`, 'WebSocket')
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
      this?.blapy?.logger?.info('Disconnecting from WebSocket', 'WebSocket')
      this.ws.close(code, reason)
    }

    this.isConnected = false
    this.ws = null
  }

  /**
   * Send a message through the WebSocket.
   *
   * @param {Object} message - The message object to send.
   * @param {boolean} [expectResponse=false] - Whether to expect a response.
   * @returns {Promise<Object>|null} Promise that resolves with response if expectResponse is true.
   */
  send(message, expectResponse = false) {
    if (!this.isConnected) {
      this?.blapy?.logger?.warn('WebSocket not connected, queuing message', 'WebSocket')
      this.messageQueue.push({ message, expectResponse })
      return expectResponse ? Promise.reject(new Error('Not connected')) : null
    }

    const messageWithId = {
      ...message,
      id: ++this.messageId,
      timestamp: Date.now(),
      clientId: this.options.clientId,
    }

    if (expectResponse) {
      return new Promise((resolve, reject) => {
        this.pendingResponses.set(messageWithId.id, { resolve, reject })

        // Timeout for response
        setTimeout(() => {
          if (this.pendingResponses.has(messageWithId.id)) {
            this.pendingResponses.delete(messageWithId.id)
            reject(new Error('Response timeout'))
          }
        }, 10000) // 10 second timeout

        this._sendMessage(messageWithId)
      })
    } else {
      this._sendMessage(messageWithId)
      return null
    }
  }

  /**
   * Send a Blapy command to remote instances.
   *
   * @param {string} command - The Blapy command (postData, updateBlock, etc.).
   * @param {Object} data - Command parameters.
   * @param {string} [targetClientId] - Specific client ID to target (optional).
   * @returns {Promise<Object>|null} Promise with response if expecting one.
   */
  sendBlapyCommand(command, data, targetClientId = null) {
    const message = {
      type: 'blapy_command',
      command: command,
      data: data,
      target: targetClientId,
    }

    this?.blapy?.logger?.info(`Sending Blapy command: ${command}`, 'WebSocket')
    return this.send(message, false)
  }

  /**
   * Request data from a remote Blapy instance.
   *
   * @param {string} blockName - Name of the block to request data from.
   * @param {string} [targetClientId] - Specific client ID to target.
   * @returns {Promise<Object>} Promise that resolves with the requested data.
   */
  requestData(blockName, targetClientId = null) {
    const message = {
      type: 'data_request',
      blockName: blockName,
      target: targetClientId,
    }

    this?.blapy?.logger?.info(`Requesting data for block: ${blockName}`, 'WebSocket')
    return this.send(message, true)
  }

  /**
   * Broadcast a message to all connected clients.
   *
   * @param {Object} data - Data to broadcast.
   */
  broadcast(data) {
    const message = {
      type: 'broadcast',
      data: data,
    }

    this?.blapy?.logger?.info('Broadcasting message', 'WebSocket')
    this.send(message, false)
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
      this?.blapy?.logger?.warn(`Unknown event: ${event}`, 'WebSocket')
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
      queuedMessages: this.messageQueue.length,
      pendingResponses: this.pendingResponses.size,
    }
  }

  // Private methods

  /**
   * Handle incoming WebSocket messages.
   *
   * @private
   * @param {MessageEvent} event - WebSocket message event.
   */
  _handleMessage(event) {
    try {


      const message = JSON.parse(event.data)

      this?.blapy?.logger?.info(`Received message: ${message.type}`, 'WebSocket')

      // Handle response to our requests
      if (message.id && this.pendingResponses.has(message.id)) {
        const { resolve } = this.pendingResponses.get(message.id)
        this.pendingResponses.delete(message.id)
        resolve(message.data)
        return
      }


      switch (message.type) {
        case 'blapy_command':
          this._handleBlapyCommand(message)
          break

        case 'data_request':
          this._handleDataRequest(message)
          break

        case 'broadcast':
          this._handleBroadcast(message)
          break
      }

      // Trigger message callbacks
      this._triggerCallbacks('onMessage', message)

    } catch (error) {
      this?.blapy?.logger?.error(`Error parsing message: ${error.message}`, 'WebSocket')
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
      this?.blapy?.logger?.error('No Blapy instance attached, cannot execute command', 'WebSocket')
      return
    }

    const { command, data } = message

    // Security check
    if (!this.options.allowedCommands.includes(command)) {
      this?.blapy?.logger?.warn(`Command not allowed: ${command}`, 'WebSocket')
      return
    }

    this?.blapy?.logger?.info(`Executing Blapy command: ${command}`, 'WebSocket')

    console.log("ouais?")

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
          this?.blapy?.logger?.warn(`Unknown Blapy command: ${command}`, 'WebSocket')
      }
    } catch (error) {
      this?.blapy?.logger?.error(`Error executing command: ${error.message}`, 'WebSocket')
    }
  }

  /**
   * Handle data requests from remote clients.
   *
   * @private
   * @param {Object} message - The data request message.
   */
  _handleDataRequest(message) {
    if (!this.blapy) {
      this._sendMessage({
        type: 'data_response',
        id: message.id,
        error: 'No Blapy instance available',
      })
      return
    }

    const { blockName } = message

    try {
      // Find the requested block
      const block = this.blapy.container.querySelector(`[data-blapy-container-name="${blockName}"]`)

      if (!block) {
        this._sendMessage({
          type: 'data_response',
          id: message.id,
          error: `Block not found: ${blockName}`,
        })
        return
      }

      // Extract block data
      const blockData = {
        name: blockName,
        content: block.innerHTML,
        attributes: Array.from(block.attributes).reduce((acc, attr) => {
          acc[attr.name] = attr.value
          return acc
        }, {}),
        timestamp: Date.now(),
      }

      this._sendMessage({
        type: 'data_response',
        id: message.id,
        data: blockData,
      })

    } catch (error) {
      this._sendMessage({
        type: 'data_response',
        id: message.id,
        error: error.message,
      })
    }
  }

  /**
   * Handle broadcast messages.
   *
   * @private
   * @param {Object} message - The broadcast message.
   */
  _handleBroadcast(message) {
    this?.blapy?.logger?.info('Received broadcast message', 'WebSocket')

    // Trigger custom event for broadcast
    if (this.blapy) {
      this.blapy.trigger('BlapySocket_Broadcast', message.data)
    }
  }

  /**
   * Send a message through the WebSocket.
   *
   * @private
   * @param {Object} message - Message to send.
   */
  _sendMessage(message) {
    if (this.ws && this.isConnected) {
      try {
        this.ws.send(JSON.stringify(message))
        this?.blapy?.logger?.info(`Message sent: ${message.type}`, 'WebSocket')
      } catch (error) {
        this?.blapy?.logger?.error(`Error sending message: ${error.message}`, 'WebSocket')
      }
    }
  }

  /**
   * Flush queued messages when connection is restored.
   *
   * @private
   */
  _flushMessageQueue() {
    if (this.messageQueue.length > 0) {
      this?.blapy?.logger?.info(`Sending ${this.messageQueue.length} queued messages`, 'WebSocket')

      const queue = [...this.messageQueue]
      this.messageQueue = []

      queue.forEach(({ message, expectResponse }) => {
        this.send(message, expectResponse)
      })
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

    this?.blapy?.logger?.info(`Scheduling reconnection attempt ${this.reconnectAttempts} in ${delay}ms`, 'WebSocket')

    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null
      this?.blapy?.logger?.info(`Reconnection attempt ${this.reconnectAttempts}`, 'WebSocket')

      this.connect().then(() => {
        this._triggerCallbacks('onReconnect', { attempt: this.reconnectAttempts })
      }).catch((error) => {
        this?.blapy?.logger?.error(`Reconnection attempt ${this.reconnectAttempts} failed: ${error.message}`, 'WebSocket')
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
          this?.blapy?.logger?.error(`Error in ${event} callback: ${error.message}`, 'WebSocket')
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