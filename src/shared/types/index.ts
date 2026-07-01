import { RouterOptions } from 'navigo'
import { Blapy } from '../../core/Blapy'

export type Primitive = string | number | boolean | bigint | symbol | null | undefined

export interface AjaxOptions extends RequestInit {
  params?: string | string[][] | Record<string, string> | URLSearchParams
  timeout?: number;
}

export interface LoggerOptions {
  debug?: boolean
  logLevel?: number
  alertError?: boolean
}

export interface BlapyRouterOptions extends RouterOptions {
  enableRouter: boolean;
  root: string
}

export interface NavigationOptions {
  title?: string;
  stateObj?: object;
  historyAPIMethod?: 'pushState' | 'replaceState';
  updateBrowserURL?: boolean;
  callHandler?: boolean;
  callHooks?: boolean;
  updateState?: boolean;
  force?: boolean;
  params?: Object;
  noBlapyData?: any;
}

export interface BlapyOptions {
  debug?: boolean
  logLevel?: number
  alertError?: boolean
  enableRouter?: boolean
  routerRoot?: string
  routerHash?: boolean
  pageLoadedFunction?: (() => void) | null;
  pageReadyFunction?: (() => void) | null;
  beforePageLoad?: ((data?: StateData) => void) | null;
  beforeContentChange?: ((container?: HTMLElement) => void) | null;
  afterContentChange?: ((container?: HTMLElement) => void) | null;
  afterPageChange?: (() => void) | null;
  onErrorOnPageChange?: ((data?: StateData) => void) | null;
  doCustomChange?: ((container?: HTMLElement, newContainer?: HTMLElement) => void) | null;
  fsmExtension?: (Object | null)
  LogLevelIfsm?: number
  debugIfsm?: boolean;
  theBlapy?: Blapy
  /**
   * Optional animation provider used by `data-blapy-update` values such as
   * "fadeInOut" / "rightOutIn". Import Blapymotion and pass `new Blapymotion()`
   * to enable animations; leave undefined to keep them (and their code) out.
   */
  animation?: AnimationProvider | null
  /**
   * Optional WebSocket options. When provided (non-empty) AND a global
   * `BlapySocket` class is loaded (via `<script src="dist/BlapySocket.js">`),
   * Blapy auto-instantiates the socket so it can receive real-time commands.
   */
  websocketOptions?: BlapySocketOptions
}
type HTTPMethod =
  | "GET"
  | "POST"
  | "PUT"
  | "PATCH"
  | "DELETE"
  | "OPTIONS"
  | "HEAD";

/**
 * Options for the optional BlapySocket WebSocket module. Passing a non-empty
 * `websocketOptions` to Blapy makes it auto-instantiate a globally-loaded
 * `BlapySocket` (from a separate `<script src="dist/BlapySocket.js">`).
 */
export interface BlapySocketOptions {
  /** WebSocket server URL. */
  url?: string
  /** Connect immediately on instantiation. */
  autoConnect?: boolean
  /** Delay between reconnection attempts (ms). */
  reconnectDelay?: number
  /** Maximum number of reconnection attempts. */
  maxReconnectAttempts?: number
  /** Whitelist of remote Blapy commands the socket is allowed to dispatch. */
  allowedCommands?: string[]
  /** Authentication payload sent on connection. */
  auth?: unknown | null
  /** Unique client identifier (auto-generated when omitted). */
  clientId?: string
}

/**
 * An animation provider: a bag of named transition functions that Blapy calls
 * when a block's `data-blapy-update` matches one of the keys (e.g. "fadeInOut").
 * Blapymotion implements this interface, but it's fully optional — pass your own
 * or none at all.
 */
export interface AnimationProvider {
  [name: string]: (oldContainer: HTMLElement, newContainer: HTMLElement) => void;
}

/** A resolved Blapy template, as returned by TemplateManager.getTemplate(). */
export interface BlapyTemplate {
  content: string;
  allTemplates: NodeListOf<Element>;
}

export interface StateData {
  aObjectId?: string,
  aUrl?: string;
  html?: string;
  htmlPage?: any;
  method?: HTTPMethod;
  noBlapyData?: any;
  params?: {
    embeddingBlockId?: string;
    templateId?: string;
    blapyobjectid?: string;
    blapyaction?: string;
    blapycall?: string;
    'force-update'?: number;
    /** Blapy params are a dynamic bag carried between FSM states. */
    [key: string]: any;
  };
}