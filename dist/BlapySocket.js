/**
 * -----------------------------------------------------------------------------------------
 * INTERSEL - 4 cité d'Hauteville - 75010 PARIS
 * RCS PARIS 488 379 660 - NAF 721Z
 *
 * File : BlapySocket
 * Optional WebSocket module for Blapy (standalone browser build, receive-only).
 * Load with <script src="dist/BlapySocket.js"> and pass `websocketOptions` to Blapy.
 *
 * -----------------------------------------------------------------------------------------
 * @copyright Intersel 2015-2026
 * @see {@link https://github.com/intersel/blapy2}
 * @version 2.1.2
 * @license DonationWare - see https://github.com/intersel/blapy2/blob/master/LICENSE
 * -----------------------------------------------------------------------------------------
 */
var BlapySocketBundle=function(){"use strict";/**
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
 */class n{options;ws=null;isConnected=!1;reconnectAttempts=0;reconnectTimer=null;blapy;callbacks={onOpen:[],onClose:[],onError:[],onMessage:[],onReconnect:[]};constructor(e={},t){this.blapy=t,this.options={url:"ws://localhost:8080",autoConnect:!1,reconnectDelay:3e3,maxReconnectAttempts:10,allowedCommands:["postData","updateBlock","reloadBlock","loadUrl","trigger"],auth:null,clientId:this._generateClientId(),...e},this.options.autoConnect&&this.connect(),this.blapy.logger.info("BlapySocket initialized (Receive Only)","WebSocket")}connect(){return new Promise((e,t)=>{if(this.isConnected){this.blapy.logger.warn("Already connected to WebSocket","WebSocket"),e();return}this.blapy.logger.info(`Connecting to WebSocket: ${this.options.url}`,"WebSocket");try{this.ws=new WebSocket(this.options.url),this.ws.onopen=s=>{this.isConnected=!0,this.reconnectAttempts=0,this._clearReconnectTimer(),this._sendIdentification(),this._triggerCallbacks("onOpen",s),e()},this.ws.onclose=s=>{this.isConnected=!1,this.blapy.logger.warn(`WebSocket closed: ${s.code} - ${s.reason}`,"WebSocket"),this._triggerCallbacks("onClose",s),s.code!==1e3&&this.reconnectAttempts<this.options.maxReconnectAttempts&&this._scheduleReconnect()},this.ws.onerror=s=>{this.blapy.logger.error("WebSocket error occurred","WebSocket"),this._triggerCallbacks("onError",s),this.isConnected||t(new Error("Failed to connect to WebSocket"))},this.ws.onmessage=s=>{this._handleMessage(s)}}catch(s){this.blapy.logger.error(`Failed to create WebSocket connection: ${this._errorMessage(s)}`,"WebSocket"),t(s instanceof Error?s:new Error(String(s)))}})}disconnect(e=1e3,t="Client disconnect"){this._clearReconnectTimer(),this.ws&&this.isConnected&&this.ws.close(e,t),this.isConnected=!1,this.ws=null}on(e,t){this.callbacks[e]?this.callbacks[e].push(t):this.blapy.logger.warn(`Unknown event: ${e}`,"WebSocket")}off(e,t){if(this.callbacks[e]){const s=this.callbacks[e].indexOf(t);s>-1&&this.callbacks[e].splice(s,1)}}getStatus(){return{connected:this.isConnected,url:this.options.url,clientId:this.options.clientId,reconnectAttempts:this.reconnectAttempts}}_sendIdentification(){if(this.ws&&this.isConnected){const e={type:"identify",clientId:this.options.clientId,blapyInstance:this.blapy?.myUIObjectID||"unknown",timestamp:Date.now()};this.options.auth&&(e.auth=this.options.auth);try{this.ws.send(JSON.stringify(e))}catch(t){this.blapy.logger.error(`Error sending identification: ${this._errorMessage(t)}`,"WebSocket")}}}_handleMessage(e){try{const t=JSON.parse(e.data);switch(t.type){case"blapy_command":this._handleBlapyCommand(t);break;case"broadcast":this._handleBroadcast(t);break;default:this.blapy.logger.info(`Unhandled message type: ${t.type}`,"WebSocket")}this._triggerCallbacks("onMessage",t)}catch(t){this.blapy.logger.error(`Error parsing message: ${this._errorMessage(t)}`,"WebSocket")}}_handleBlapyCommand(e){if(!this.blapy)return;const{command:t,data:s}=e;if(!this.options.allowedCommands.includes(t)){this.blapy.logger.warn(`Command not allowed: ${t}`,"WebSocket");return}try{switch(t){case"postData":this.blapy.myFSM.trigger("postData",s);break;case"updateBlock":this.blapy.myFSM.trigger("updateBlock",s);break;case"reloadBlock":this.blapy.myFSM.trigger("reloadBlock",s);break;case"loadUrl":this.blapy.myFSM.trigger("loadUrl",s);break;case"trigger":s.event&&this.blapy.trigger&&this.blapy.trigger(s.event,s.payload);break;default:this.blapy.logger.warn(`Unknown Blapy command: ${t}`,"WebSocket")}}catch(o){this.blapy.logger.error(`Error executing command: ${this._errorMessage(o)}`,"WebSocket")}}_handleBroadcast(e){this.blapy&&this.blapy.trigger("BlapySocket_Broadcast",e.data)}_scheduleReconnect(){if(this.reconnectTimer)return;this.reconnectAttempts++;const e=this.options.reconnectDelay*Math.pow(1.5,this.reconnectAttempts-1);this.blapy.logger.info(`Scheduling reconnection attempt ${this.reconnectAttempts} in ${e}ms`,"WebSocket"),this.reconnectTimer=setTimeout(()=>{this.reconnectTimer=null,this.blapy.logger.info(`Reconnection attempt ${this.reconnectAttempts}`,"WebSocket"),this.connect().then(()=>{this._triggerCallbacks("onReconnect",{attempt:this.reconnectAttempts})}).catch(t=>{this.blapy.logger.error(`Reconnection attempt ${this.reconnectAttempts} failed: ${this._errorMessage(t)}`,"WebSocket")})},e)}_clearReconnectTimer(){this.reconnectTimer&&(clearTimeout(this.reconnectTimer),this.reconnectTimer=null)}_triggerCallbacks(e,t){this.callbacks[e]&&this.callbacks[e].forEach(s=>{try{s(t)}catch(o){this.blapy.logger.error(`Error in ${e} callback: ${this._errorMessage(o)}`,"WebSocket")}})}_generateClientId(){return"blapy_"+Math.random().toString(36).slice(2,11)+"_"+Date.now()}_errorMessage(e){return e instanceof Error?e.message:String(e)}}return globalThis.BlapySocket=n,n}();
