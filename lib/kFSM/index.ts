/**
 * -----------------------------------------------------------------------------------------
 * iFSM.ts - TypeScript Edition
 * A finite state machine library (no dependencies)
 *
 * Rewritten from the original jQuery-based iFSM by E.Podvin / INTERSEL
 * Original: https://github.com/intersel/iFSM
 * -----------------------------------------------------------------------------------------
 *
 * @fileoverview Finite State Machine (FSM) with hierarchical sub-machine support
 * @version 3.0.0
 * -----------------------------------------------------------------------------------------
 */

// ═══════════════════════════════════════════════════════════════════════
//  Type definitions
// ═══════════════════════════════════════════════════════════════════════

/** Any DOM target the FSM can be bound to */
export type FSMTarget = Element | Document | Window | HTMLElement;

/** Processing status of the FSM */
export type ProcessEventStatus = 'idle' | 'processing';

/** Push/Pop directive */
export type PushPopDirective = 'PushState' | 'PopState';

/** Logical operator for sub-machine target conditions */
export type LogicalOperator = '||' | '&&';

/** Sub-machine condition modifier */
export type ConditionModifier = '' | 'not';

/** Log error level */
export type LogLevel = 1 | 2 | 3;

/**
 * A state function signature — `this` is bound to the FSMManager instance.
 * `D` is the type of the event data carried between states (defaults to `unknown`).
 */
export type StateFunction<D = unknown> = (
  this: FSMManager,
  parameters: unknown,
  event: FSMEvent,
  data: D,
  ...extra: unknown[]
) => boolean | void | Promise<boolean | void>;

/** Condition that can be a boolean-returning function or a string (eval'd) */
export type ConditionExpression = string | ((this: FSMManager) => boolean);

/** Internal dummy event used throughout the FSM */
export interface FSMEvent {
  data: unknown;
  target: FSMTarget;
  currentTarget: FSMTarget;
  type: string;
  stopPropagation: () => void;
}

/** How an event should be processed */
export interface HowProcessEvent {
  immediate?: boolean;
  delay?: number;
  preventcancel?: boolean;
  /** Internal — managed by the FSM */
  DelayedProcessNames?: Record<string, string>;
}

/** Condition on sub-machine states to decide on a transition */
export interface SubMachineTargetCondition {
  condition?: ConditionModifier;
  target_list: string[];
}

/** Configuration for next_state_on_target */
export interface NextStateOnTarget {
  condition: LogicalOperator;
  submachines: Record<string, SubMachineTargetCondition>;
}

/** Full event configuration within a state */
export interface EventConfiguration<D = unknown> {
  how_process_event?: HowProcessEvent;
  init_function?: StateFunction<D>;
  properties_init_function?: unknown;
  next_state?: string;
  pushpop_state?: PushPopDirective;
  next_state_when?: ConditionExpression;
  next_state_on_target?: NextStateOnTarget;
  next_state_if_error?: string;
  pushpop_state_if_error?: PushPopDirective;
  propagate_event?: boolean | string | (boolean | string)[];
  propagate_event_on_localmachine?: boolean;
  process_event_if?: ConditionExpression;
  propagate_event_on_refused?: string;
  out_function?: StateFunction<D>;
  properties_out_function?: unknown;
  prevent_bubble?: boolean;
  process_on_UItarget?: boolean;
  UI_event_bubble?: boolean;
  /** Internal — managed by the FSM */
  EventIteration?: number;
}

/** A delegate (sub) machine declaration */
export interface DelegateMachineDeclaration<D = unknown> {
  submachine: StateDefinition<D>;
  no_reinitialisation?: boolean;
  /** Internal — the live FSM instance, created at runtime */
  myFSM?: FSMManager;
}

/**
 * A single state: a map of event names to their configuration.
 * Special keys: `delegate_machines`, `enterState`, `exitState`.
 * A string value means "synonym of another event in this state".
 */
export interface StateEvents<D = unknown> {
  delegate_machines?: Record<string, DelegateMachineDeclaration<D>>;
  [eventName: string]: EventConfiguration<D> | string | Record<string, DelegateMachineDeclaration<D>> | undefined;
}

/**
 * The full state definition.
 * A string value for a state name means "synonym of another state".
 * Must include `DefaultState`.
 */
export interface StateDefinition<D = unknown> {
  DefaultState?: StateEvents<D>;
  [stateName: string]: StateEvents<D> | string | undefined;
}

/** Options for the FSM */
export interface FSMOptions {
  debug?: boolean;
  LogLevel?: LogLevel;
  AlertError?: boolean;
  maxPushEvent?: number;
  startEvent?: string;
  prefixFsmName?: string;
  logFSM?: string;
  initState?: string;
  /** Internal — propagated to sub-machines */
  rootMachine?: FSMManager;
  /** Internal — propagated to sub-machines */
  nextParent?: FSMManager;
  /** Internal */
  FSMParent?: FSMManager;
  [key: string]: unknown;

}

/** Pushed event waiting in the queue */
interface PushedEvent {
  anEvent: string;
  data: unknown[];
}

/** Bound listener record for cleanup */
interface BoundListener {
  target: EventTarget;
  event: string;
  handler: EventListener;
}

/** Trigger metadata attached to event data */
interface TriggerMeta {
  targetFSM: FSMManager;
  localMachine: boolean;
}

// ═══════════════════════════════════════════════════════════════════════
//  Internal state
// ═══════════════════════════════════════════════════════════════════════

let nbFSM = 0;

/** Registry: element id -> FSMManager[] */
const iFSMRegistry: Record<string, FSMManager[]> = {};

/** Named timers (replaces jQuery.doTimeout) */
const timers: Record<string, ReturnType<typeof setTimeout>> = {};

// ═══════════════════════════════════════════════════════════════════════
//  Internal utilities
// ═══════════════════════════════════════════════════════════════════════

function doTimeout(id: string, delay: number, fn: (...args: unknown[]) => void, ...args: unknown[]): void {
  cancelTimeout(id);
  timers[id] = setTimeout(() => {
    delete timers[id];
    fn(...args);
  }, delay);
}

function cancelTimeout(id: string): void {
  if (timers[id] !== undefined) {
    clearTimeout(timers[id]);
    delete timers[id];
  }
}

/** Deep clone that preserves function references */
function deepClone<T>(src: T, seen: WeakMap<object, unknown> = new WeakMap()): T {
  if (src === null || typeof src !== 'object') return src;
  if (src instanceof Date) return new Date(src as unknown as number) as unknown as T;
  if (src instanceof RegExp) return new RegExp(src) as unknown as T;
  if (typeof src === 'function') return src;

  const obj = src as Record<string, unknown>;
  if (seen.has(obj as object)) return seen.get(obj as object) as T;

  const copy: Record<string, unknown> = Array.isArray(src) ? ([] as unknown as Record<string, unknown>) : {};
  seen.set(obj as object, copy);

  for (const key of Object.keys(obj)) {
    const val = obj[key];
    copy[key] = typeof val === 'function' ? val : deepClone(val, seen);
  }
  return copy as unknown as T;
}

function elMatches(el: FSMTarget, ref: FSMTarget | EventTarget | null): boolean {
  if (!el || !ref) return false;
  if (el === ref) return true;
  return false;
}

function getElId(el: FSMTarget): string | null {
  if (el === document) return 'iFSMDocumentRoot';
  if (isWindowTarget(el)) return '__iFSMWindow__';
  return (el as Element).id || null;
}

function ensureId(el: FSMTarget): string {
  if (el === document) return 'iFSMDocumentRoot';
  if (isWindowTarget(el)) return '__iFSMWindow__';
  const elem = el as HTMLElement;
  if (!elem.id) {
    elem.id = 'iFSM_auto_' + (++nbFSM) + '_' + Date.now();
  }
  return elem.id;
}

function isWindowTarget(o: unknown): o is Window {
  return o === window;
}

function getCss3Prop(cssprop: string): string | undefined {
  const vendors = ['', '-moz-', '-webkit-', '-o-', '-ms-', '-khtml-'];
  const root = document.documentElement;
  const camelCase = (str: string) =>
    str.replace(/-([a-z])/gi, (_, p1: string) => p1.toUpperCase());
  for (const v of vendors) {
    let prop = camelCase(v + cssprop);
    if (prop.startsWith('Ms')) prop = 'm' + prop.slice(1);
    if (prop in root.style) return prop;
  }
  return undefined;
}

function createFSMEvent(target: FSMTarget, eventName: string, data?: unknown): FSMEvent {
  return {
    data: data ?? null,
    target,
    currentTarget: target,
    type: eventName,
    stopPropagation() {},
  };
}

function launchProcess(fsm: FSMManager, event: string, data: unknown[]): void {
  fsm._log('launchProcess:  ---> ' + event);
  fsm.processEvent(event, data, true);
}

function dispatch(el: EventTarget, eventName: string, detail: unknown): void {
  el.dispatchEvent(new CustomEvent(eventName, { detail, bubbles: true }));
}

function evaluateCondition(condition: ConditionExpression, context: FSMManager): boolean {
  if (typeof condition === 'function') {
    return condition.call(context);
  }
  // String expression — use Function constructor (safer scoping than raw eval)
  const fn = new Function('return (' + condition + ')') as () => boolean;
  return fn.call(context);
}

// ═══════════════════════════════════════════════════════════════════════
//  FSMManager — main class
// ═══════════════════════════════════════════════════════════════════════

export class FSMManager {
  // ── Public properties ────────────────────────────────────────────────
  readonly FSMName: string;
  opts: Required<Pick<FSMOptions, 'debug' | 'LogLevel' | 'AlertError' | 'maxPushEvent' | 'startEvent' | 'prefixFsmName' | 'logFSM'>> & FSMOptions;

  currentState: string;
  lastState: string;
  currentEvent: FSMEvent | string;
  currentUIEvent?: FSMEvent;
  receivedEvent?: string;
  EventIteration: number;
  actualTarget?: FSMTarget | EventTarget;
  myUIObject: FSMTarget;

  rootMachine: FSMManager;
  parentMachine: FSMManager | null;
  childrenMachine: FSMManager[];
  subMachineName: string | null;

  _stateDefinition: Record<string, StateEvents>;
  readonly _originalStateDefinition: StateDefinition;

  // ── Internal properties ──────────────────────────────────────────────
  pushStateList: string[];
  processEventStatus: ProcessEventStatus;
  pushEventList: PushedEvent[];
  listEvents: Record<string, string>;
  currentDataEvent: unknown[];
  returnGeneralEventStatus: boolean;
  preventCancelId: number;

  private _boundListeners: BoundListener[];
  private _mutationObserver: MutationObserver | null;
  private _logOffset: string;
  private lastevent: string;

  // ────────────────────────────────────────────────────────────────────
  constructor(anObject: FSMTarget, aStateDefinition: StateDefinition, options?: FSMOptions) {
    const defaults = {
      debug: true,
      LogLevel: 1 as LogLevel,
      AlertError: false,
      maxPushEvent: 100,
      startEvent: 'start',
      prefixFsmName: 'FSM_',
      logFSM: '',
    };

    nbFSM++;

    this.opts = { ...defaults, ...(options || {}) } as typeof this.opts;
    this.FSMName = this.opts.prefixFsmName + nbFSM;

    this._stateDefinition = deepClone(aStateDefinition) as Record<string, StateEvents>;
    this._originalStateDefinition = aStateDefinition;

    this.currentState = '';
    this.lastState = '';
    this.currentEvent = '';
    this.EventIteration = 0;
    this.pushStateList = [];
    this.processEventStatus = 'idle';
    this.pushEventList = [];
    this.myUIObject = anObject;
    this.listEvents = {};
    this.currentDataEvent = [];
    this.returnGeneralEventStatus = true;
    this.preventCancelId = 0;
    this.subMachineName = null;
    this._boundListeners = [];
    this._mutationObserver = null;
    this._logOffset = '';
    this.lastevent = '';

    // Root / parent machine
    if (!this.opts.rootMachine) this.opts.rootMachine = this;
    this.rootMachine = this.opts.rootMachine;

    if (this.opts.nextParent === undefined) {
      this.parentMachine = null;
    } else {
      this.parentMachine = this.opts.nextParent;
    }
    this.opts.nextParent = this;

    this.childrenMachine = [];
    if (this.parentMachine) this.parentMachine.childrenMachine.push(this);

    // ── Discover events & resolve synonyms ────────────────────────────
    const attrChangeEvents: string[] = [];
    let attrChangeRequested = false;
    let attrStyleChangeRequested = false;
    let setStart = false;

    for (const aState in this._stateDefinition) {
      const stateDef = this._stateDefinition[aState];
      // Synonym state
      if (typeof stateDef === 'string') {
        this._stateDefinition[aState] = this._stateDefinition[stateDef as string] as StateEvents;
      }
      const stateObj = this._stateDefinition[aState];
      if (!stateObj || typeof stateObj === 'string') continue;

      for (const aEvent in stateObj) {
        // Synonym event
        if (typeof stateObj[aEvent] === 'string') {
          (stateObj as Record<string, unknown>)[aEvent] =
            stateObj[stateObj[aEvent] as string];
        }

        if (
          !this.rootMachine.listEvents[aEvent] &&
          aEvent !== 'delegate_machines' &&
          aEvent !== this.opts.startEvent
        ) {
          this.listEvents[aEvent] = aEvent;
          if (this !== this.rootMachine) {
            this.rootMachine.listEvents[aEvent] = aEvent;
          }
        } else if (aEvent === this.opts.startEvent) {
          setStart = true;
        }
      }
    }

    // ── Attribute-change handling via MutationObserver ─────────────────
    for (const aEvent in this.listEvents) {
      const parts = aEvent.split('_');
      if (parts[0] === 'attrchange') {
        attrChangeRequested = true;
        attrChangeEvents.push(aEvent);
        if (parts[1] === 'style' && parts.length > 2) {
          attrStyleChangeRequested = true;
        }
      }
    }

    if (attrChangeRequested && anObject instanceof Element) {
      this._setupMutationObserver(anObject, attrChangeEvents, attrStyleChangeRequested);
    }

    // ── Bind event listeners ──────────────────────────────────────────
    const eventTarget: EventTarget = isWindowTarget(anObject)
      ? window
      : anObject === document
        ? document
        : anObject;
    const rootFSM = this.rootMachine;

    const eventNames = Object.keys(this.listEvents);
    for (const evName of eventNames) {
      if (evName.startsWith('attrchange')) continue;
      const handler: EventListener = (event: Event) => {
        const args: unknown[] = [event, (event as CustomEvent).detail ?? null];
        rootFSM.returnGeneralEventStatus = true;
        rootFSM.processEvent(event.type, args);
        return rootFSM.returnGeneralEventStatus;
      };
      eventTarget.addEventListener(evName, handler);
      this._boundListeners.push({ target: eventTarget, event: evName, handler });
    }

    // Start event listener
    if (setStart) {
      const localFSM = this;
      const startHandler: EventListener = (event: Event) => {
        const args: unknown[] = [event, (event as CustomEvent).detail ?? null];
        localFSM.processEvent(event.type, args);
      };
      eventTarget.addEventListener(this.opts.startEvent, startHandler);
      this._boundListeners.push({ target: eventTarget, event: this.opts.startEvent, handler: startHandler });
    }

    this._log('new FSMManager:' + this.FSMName, 2);
  }

  // ── MutationObserver setup ────────────────────────────────────────────
  private _setupMutationObserver(el: Element, attrChangeEvents: string[], trackStyleChanges: boolean): void {
    this._mutationObserver = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type !== 'attributes' || !mutation.attributeName) continue;
        const attrName = mutation.attributeName;
        const oldValue = mutation.oldValue;
        const newValue = el.getAttribute(attrName);

        if (attrChangeEvents.includes('attrchange')) {
          dispatch(el, 'attrchange', { attributeName: attrName, oldValue, newValue });
        }
        if (attrChangeEvents.includes('attrchange_' + attrName)) {
          dispatch(el, 'attrchange_' + attrName, { oldValue, newValue });
        }
        if (attrName === 'style' && trackStyleChanges) {
          const parseStyles = (str: string | null): Record<string, string> => {
            const map: Record<string, string> = {};
            if (!str) return map;
            for (const part of str.split(';')) {
              const idx = part.indexOf(':');
              if (idx > 0) {
                map[part.slice(0, idx).trim()] = part.slice(idx + 1).trim();
              }
            }
            return map;
          };
          const newStyles = parseStyles(newValue);
          const oldStyles = parseStyles(oldValue);
          for (const prop in newStyles) {
            if (!oldStyles[prop] || oldStyles[prop] !== newStyles[prop]) {
              const camelProp = getCss3Prop(prop) || prop;
              const evtName = 'attrchange_style_' + camelProp;
              if (attrChangeEvents.includes(evtName)) {
                dispatch(el, evtName, { newValue: newStyles[prop], oldValue: oldStyles[prop] });
              }
            }
          }
        }
      }
    });
    this._mutationObserver.observe(el, { attributes: true, attributeOldValue: true });
  }

  // ════════════════════════════════════════════════════════════════════
  //  InitManager
  // ════════════════════════════════════════════════════════════════════
  InitManager(aInitState?: string): void {
    this._log('InitManager');
    this.currentState = aInitState || 'DefaultState';
    if (!this._stateDefinition.DefaultState) {
      this._stateDefinition.DefaultState = {};
    }

    if (!this.parentMachine) {
      this.trigger(this.opts.startEvent);
    } else {
      const anEv: unknown[] = [createFSMEvent(this.myUIObject, this.opts.startEvent)];
      this.processEvent(this.opts.startEvent, anEv, true);
    }
  }

  // ════════════════════════════════════════════════════════════════════
  //  processEvent
  // ════════════════════════════════════════════════════════════════════
  processEvent(anEvent: string, data: unknown[], forceProcess?: boolean): void {
    const currentState = this.currentState;
    const currentEvent = data[0] as FSMEvent;
    this.currentUIEvent = currentEvent;
    this.receivedEvent = anEvent;
    this.currentDataEvent = data;
    this.currentEvent = currentEvent;
    let currentStateEvent = this.currentState;
    let doForceProcess = forceProcess !== undefined;

    const anEv: unknown[] = [createFSMEvent(this.myUIObject, '', null)];
    anEv[1] = data[1];
    anEv[2] = data[2];

    this._log(
      'processEvent: ' + this.FSMName + ':' + currentState + ':' + anEvent + '-> START',
      3, 1,
    );

    // ── Target machine check ──────────────────────────────────────────
    if (data.length > 1) {
      const meta = data[data.length - 1] as TriggerMeta | null;
      if (
        meta?.targetFSM &&
        meta.targetFSM !== this &&
        (meta.localMachine || meta.targetFSM.rootMachine !== this.rootMachine)
      ) {
        this._log('processEvent: ' + this.FSMName + ':' + currentState + ':' + anEvent + '-> not for this machine', 3);
        this._log('processEvent: EXIT', 3, -1);
        return;
      }
    }

    // ── Sub-machine parent state check ────────────────────────────────
    if (this.subMachineName && this.parentMachine) {
      const parentDef = this.parentMachine._stateDefinition[this.parentMachine.currentState];
      if (
        !parentDef?.delegate_machines ||
        !parentDef.delegate_machines[this.subMachineName]
      ) {
        this._log('processEvent: submachine cant run -> exit', 3);
        this._log('processEvent: EXIT', 3, -1);
        return;
      }
    }

    if (!this._stateDefinition[currentState]) {
      this._log('processEvent: currentState "' + currentState + '" does not exist!', 1);
      this._log('processEvent: EXIT', 3, -1);
      return;
    }

    if (anEvent === 'enterState' || anEvent === 'exitState') doForceProcess = true;

    // ── Target element check ──────────────────────────────────────────
    const evtTarget = currentEvent.target;
    const evtCurrent = currentEvent.currentTarget;
    if (
      !elMatches(this.myUIObject, evtCurrent) &&
      !elMatches(this.myUIObject, evtTarget) &&
      this.myUIObject !== document &&
      !isWindowTarget(evtCurrent) &&
      !isWindowTarget(evtTarget)
    ) {
      this._log('processEvent: not a good target -> exit', 3);
      this._log('processEvent: EXIT', 3, -1);
      return;
    } else {
      this.actualTarget = this.myUIObject === document ? document : evtCurrent;
    }

    let currentEventConfiguration = this._stateDefinition[currentState]?.[anEvent] as EventConfiguration | undefined;

    // ── Push event if busy ────────────────────────────────────────────
    if (
      !doForceProcess &&
      this.processEventStatus !== 'idle' &&
      (!currentEventConfiguration?.how_process_event ||
        (currentEventConfiguration.how_process_event.immediate === undefined &&
          currentEventConfiguration.how_process_event.delay === undefined))
    ) {
      this.pushEvent(anEvent, data);
      this._log('processEvent: Event pushed -> exit', 3);
      this._log('processEvent: EXIT', 3, -1);
      return;
    }

    this.lastevent = currentState + '-' + anEvent;

    // ── Sub-machines ──────────────────────────────────────────────────
    const delegateMachines = this._stateDefinition[currentState]?.delegate_machines;
    if (delegateMachines) {
      for (const aSubMachine in delegateMachines) {
        this._log('processEvent: delegate to submachine -> ' + aSubMachine, 3);
        const smDef = delegateMachines[aSubMachine] as DelegateMachineDeclaration;

        // Create if needed
        if (!smDef.myFSM) {
          this._log('processEvent: create FSM for submachine ' + aSubMachine, 3);
          smDef.myFSM = new FSMManager(this.myUIObject, smDef.submachine, this.opts);
          smDef.myFSM.opts.FSMParent = this;
          smDef.myFSM.subMachineName = aSubMachine;
        }

        if (anEvent === 'enterState') {
          if (smDef.myFSM.currentState === '' || !smDef.no_reinitialisation) {
            smDef.myFSM.InitManager();
          }
        } else if (anEvent === 'exitState') {
          (anEv[0] as FSMEvent).type = 'exitMachine';
          smDef.myFSM.processEvent('exitMachine', anEv, true);
          smDef.myFSM.cancelDelayedProcess();
        } else {
          smDef.myFSM.processEvent(anEvent, data);

          if (currentState !== this.currentState) {
            this._log('processEvent: submachine changed environment', 3);
            this.cleanExitProcess();
            this._log('processEvent: EXIT', 3, -1);
            return;
          }

          // Check prevent_bubble
          const smState = smDef.myFSM.currentState;
          const smStateDef = smDef.myFSM._stateDefinition;
          if (
            (smStateDef[smState]?.[anEvent] as EventConfiguration)?.prevent_bubble ||
            (smStateDef.DefaultState?.[anEvent] as EventConfiguration)?.prevent_bubble ||
            anEvent === this.opts.startEvent
          ) {
            this._log('processEvent: prevent_bubble -> exit', 3);
            this.cleanExitProcess();
            this._log('processEvent: EXIT', 3, -1);
            return;
          }
        }
      }
    }

    // ── Resolve event configuration ───────────────────────────────────
    if (currentState === 'DefaultState' || currentEventConfiguration === undefined) {
      this._log('processEvent: fallback to DefaultState for ' + anEvent, 3);
      currentEventConfiguration = this._stateDefinition.DefaultState?.[anEvent] as EventConfiguration | undefined;

      if (currentEventConfiguration === undefined) {
        if (!['start', 'enterState', 'exitState', 'exitMachine'].includes(anEvent)) {
          this._log('processEvent: fallback to catchEvent for ' + anEvent, 3);
          currentEventConfiguration = this._stateDefinition.DefaultState?.catchEvent as EventConfiguration | undefined;
          if (currentEventConfiguration && !this._stateDefinition.DefaultState![anEvent]) {
            (this._stateDefinition.DefaultState as Record<string, unknown>)[anEvent] = deepClone(currentEventConfiguration);
          }
        }
      }

      if (!currentEventConfiguration) {
        this._log('processEvent: Event ' + anEvent + ' not found -> exit', 3);
        this.cleanExitProcess();
        this._log('processEvent: EXIT', 3, -1);
        return;
      }
      currentStateEvent = 'DefaultState';
    }

    // ── PopState resolution ───────────────────────────────────────────
    if (
      currentEventConfiguration.pushpop_state === 'PopState' &&
      this.pushStateList.length > 0
    ) {
      currentEventConfiguration.next_state = this.pushStateList[this.pushStateList.length - 1];
    }
    if (
      currentEventConfiguration.pushpop_state_if_error === 'PopState' &&
      this.pushStateList.length > 0
    ) {
      currentEventConfiguration.next_state_if_error = this.pushStateList[this.pushStateList.length - 1];
    }

    // ── process_on_UItarget ───────────────────────────────────────────
    if (
      !elMatches(this.myUIObject, evtTarget) &&
      this.myUIObject !== document &&
      !isWindowTarget(evtCurrent) &&
      !isWindowTarget(evtTarget) &&
      currentEventConfiguration.process_on_UItarget
    ) {
      this._log('processEvent: wrong UI target (process_on_UItarget) -> exit', 3);
      this.cleanExitProcess();
      this._log('processEvent: EXIT', 3, -1);
      return;
    }

    // ── UI_event_bubble ───────────────────────────────────────────────
    if (!currentEventConfiguration.UI_event_bubble) {
      currentEvent.stopPropagation();
      this.returnGeneralEventStatus = false;
      this.rootMachine.returnGeneralEventStatus = false;
    }

    // ── Delayed event ─────────────────────────────────────────────────
    if (
      !doForceProcess &&
      currentEventConfiguration.how_process_event?.delay
    ) {
      this._log('processEvent: Event ' + anEvent + ' delayed -> exit', 3);
      this.delayProcess(anEvent, currentEventConfiguration.how_process_event.delay, data);
      this.cleanExitProcess();
      this._log('processEvent: EXIT', 3, -1);
      return;
    }

    // ── EventIteration ────────────────────────────────────────────────
    const stateEvtDef = this._stateDefinition[currentStateEvent]?.[anEvent] as EventConfiguration;
    if (stateEvtDef) {
      stateEvtDef.EventIteration = (stateEvtDef.EventIteration ?? 0) + 1;
      this.EventIteration = stateEvtDef.EventIteration;
    }

    // ── process_event_if ──────────────────────────────────────────────
    if (currentEventConfiguration.process_event_if !== undefined) {
      if (!evaluateCondition(currentEventConfiguration.process_event_if, this)) {
        this._log('processEvent: refused by process_event_if', 3);
        if (currentEventConfiguration.propagate_event_on_refused) {
          this.trigger(
            currentEventConfiguration.propagate_event_on_refused,
            null,
            currentEventConfiguration.propagate_event_on_localmachine,
          );
        }
        this.cleanExitProcess();
        this._log('processEvent: EXIT', 3, -1);
        return;
      }
    }

    // *********************************************
    //  Actually processing the event
    // *********************************************
    this._log('processEvent: ' + this.FSMName + ':' + currentState + ':' + anEvent + '-> processing', 2);
    const lastStatus = this.processEventStatus;
    this.processEventStatus = 'processing';

    let funcReturn: boolean | void | Promise<boolean | void> = true;

    // Clear preventCancel tag
    const dataObj = data[1] as Record<string, unknown> | null;
    if (dataObj?.preventCancelSet) delete dataObj.preventCancelSet;

    // ── init_function ─────────────────────────────────────────────────
    if (currentEventConfiguration.init_function) {
      const localdata = [currentEventConfiguration.properties_init_function, ...data];
      funcReturn = currentEventConfiguration.init_function.apply(this, localdata as Parameters<StateFunction>);
      this._log('processEvent: init_function done', 3);
    }

    // ── State transition ──────────────────────────────────────────────

    // Push/Pop
    if (funcReturn !== false && currentEventConfiguration.pushpop_state) {
      switch (currentEventConfiguration.pushpop_state) {
        case 'PushState':
          this.pushStateList.push(this.currentState);
          break;
        case 'PopState':
          if (this.pushStateList.length > 0) this.pushStateList.pop();
          break;
      }
    }

    // next_state_when evaluation
    let nextStateWhenResult: boolean | undefined;
    if (currentEventConfiguration.next_state_when !== undefined) {
      nextStateWhenResult = evaluateCondition(currentEventConfiguration.next_state_when, this);
    }

    // Do we change state?
    if (
      funcReturn !== false &&
      currentEventConfiguration.next_state &&
      currentState !== currentEventConfiguration.next_state &&
      (
        (currentEventConfiguration.next_state_when === undefined &&
          currentEventConfiguration.next_state_on_target === undefined) ||
        (currentEventConfiguration.next_state_when !== undefined && nextStateWhenResult === true) ||
        (currentEventConfiguration.next_state_on_target &&
          this.subMachinesRespectTargets(anEvent))
      )
    ) {
      // Reset event iterations
      const stateDef = this._stateDefinition[this.currentState];
      if (stateDef) {
        for (const key in stateDef) {
          if (key !== 'delegate_machines') {
            const evt = stateDef[key] as EventConfiguration;
            if (evt && typeof evt === 'object') evt.EventIteration = 0;
          }
        }
      }

      this.cancelDelayedProcess();

      // Exit state
      (anEv[0] as FSMEvent).type = 'exitState';
      if (anEvent !== this.opts.startEvent) {
        this.processEvent('exitState', anEv, true);
      }

      // *** Change state ***
      if (this._stateDefinition[currentEventConfiguration.next_state]) {
        this._log('processEvent: Go to ' + currentEventConfiguration.next_state, 3);
        this.lastState = this.currentState;
        this.currentState = currentEventConfiguration.next_state;
      } else {
        this._log('processEvent: ' + currentEventConfiguration.next_state + ' DOES NOT EXIST!', 1);
        this.lastState = this.currentState;
      }

      // Enter state
      (anEv[0] as FSMEvent).type = 'enterState';
      this.processEvent('enterState', anEv, true);

      // Propagate
      this._propagateEvents(currentEventConfiguration, anEvent, data);
    } else if (funcReturn !== false && currentEventConfiguration.propagate_event !== undefined) {
      // Same state, propagate
      this._propagateEvents(currentEventConfiguration, anEvent, data);
    } else if (funcReturn === false && currentEventConfiguration.next_state_if_error) {
      // Error path
      this._log('processEvent: error in init_function', 3);
      if (currentEventConfiguration.pushpop_state_if_error) {
        switch (currentEventConfiguration.pushpop_state_if_error) {
          case 'PushState':
            this.pushStateList.push(this.currentState);
            break;
          case 'PopState':
            if (this.pushStateList.length > 0) this.pushStateList.pop();
            break;
        }
      }

      this._log('processEvent: Go to (error) ' + currentEventConfiguration.next_state_if_error, 3);
      this.lastState = this.currentState;
      this.currentState = currentEventConfiguration.next_state_if_error;

      (anEv[0] as FSMEvent).type = 'enterState';
      this.processEvent('enterState', anEv, true);
    } else {
      this._log('processEvent: nothing to do', 3);
    }

    // ── out_function ──────────────────────────────────────────────────
    if (currentEventConfiguration.out_function) {
      const localdata = [currentEventConfiguration.properties_out_function, ...data];
      currentEventConfiguration.out_function.apply(this, localdata as Parameters<StateFunction>);
      this._log('processEvent: out_function done', 3);
    }

    this.processEventStatus = lastStatus;
    this.cleanExitProcess();
    this._log('processEvent: ' + this.FSMName + ':' + currentState + ':' + anEvent + '-> EXIT', 3, -1);
  }

  // ── propagate helper ────────────────────────────────────────────────
  private _propagateEvents(config: EventConfiguration, anEvent: string, data: unknown[]): void {
    if (config.propagate_event === undefined) return;
    let events = config.propagate_event;
    if (!Array.isArray(events)) events = [events];
    for (const ev of events) {
      this._log('processEvent: propagate -> ' + ev, 3);
      if (ev === true) {
        this.trigger(anEvent, data[1], config.propagate_event_on_localmachine);
      } else {
        this.trigger(ev as string, data[1], config.propagate_event_on_localmachine);
      }
    }
  }

  // ════════════════════════════════════════════════════════════════════
  //  Event queue
  // ════════════════════════════════════════════════════════════════════

  cleanExitProcess(): void {
    if (
      this.pushEventList.length &&
      (this.processEventStatus === 'idle' || this.pushEventList.length > this.opts.maxPushEvent)
    ) {
      this.popEvent();
    }
  }

  pushEvent(anEvent: string, data?: unknown[]): void {
    this._log('pushEvent: -> ' + anEvent);
    if (this.pushEventList.length > this.opts.maxPushEvent) {
      this._log('pushEvent: too many events -> ' + this.pushEventList.length, 2);
      return;
    }
    if (!data || !Array.isArray(data) || !(data[0] as FSMEvent)?.type) {
      data = [createFSMEvent(this.myUIObject, anEvent), data];
    }
    this.pushEventList.push({ anEvent, data });
  }

  popEvent(): boolean {
    this._log('popEvent');
    if (this.pushEventList.length > 0) {
      const evt = this.pushEventList.shift()!;
      if (!evt.anEvent) return false;
      this.processEvent(evt.anEvent, evt.data);
      return true;
    }
    return false;
  }

  // ════════════════════════════════════════════════════════════════════
  //  Delayed events
  // ════════════════════════════════════════════════════════════════════

  delayProcess(anEvent: string, aDelay: number, data: unknown[]): void {
    this._log('delayProcess: -> ' + anEvent);
    this.preventCancelId++;

    let currentState = this.currentState;
    let name = getElId(this.myUIObject) + currentState + anEvent + this.preventCancelId;

    if (!data[1]) data[1] = {};
    if (!this._stateDefinition[this.currentState]?.[anEvent]) currentState = 'DefaultState';

    const evtCfg = this._stateDefinition[currentState][anEvent] as EventConfiguration;
    if (!evtCfg.how_process_event!.DelayedProcessNames) {
      evtCfg.how_process_event!.DelayedProcessNames = {};
    }

    if (evtCfg.how_process_event!.preventcancel) {
      const d = data[1] as Record<string, unknown>;
      if (d.preventCancelSet) name = d.preventCancelSet as string;
      else d.preventCancelSet = name;
    }

    evtCfg.how_process_event!.DelayedProcessNames[name] = name;
    doTimeout(name, aDelay, launchProcess as (...args: unknown[]) => void, this, anEvent, data);
  }

  cancelDelayedProcess(): void {
    this._log('cancelDelayedProcess');
    for (const aEvent in this._stateDefinition[this.currentState]) {
      let cs = this.currentState;
      if (!this._stateDefinition[cs]?.[aEvent]) cs = 'DefaultState';
      if (!this._stateDefinition[cs]?.[aEvent]) {
        this._log('cancelDelayedProcess: ' + aEvent + ' has no definition', 1);
        return;
      }
      const cfg = this._stateDefinition[cs][aEvent] as EventConfiguration;
      if (cfg.how_process_event && !cfg.how_process_event.preventcancel) {
        if (cfg.how_process_event.DelayedProcessNames) {
          for (const n in cfg.how_process_event.DelayedProcessNames) {
            cancelTimeout(n);
          }
          cfg.how_process_event.DelayedProcessNames = {};
        }
      }
    }
  }

  // ════════════════════════════════════════════════════════════════════
  //  trigger
  // ════════════════════════════════════════════════════════════════════

  trigger(aEventName: string, data?: unknown, sendToLocalMachine?: boolean): void {
    const local = !!sendToLocalMachine;
    const anEv: unknown[] = [createFSMEvent(this.myUIObject, aEventName)];
    anEv[1] = data;
    anEv[2] = { targetFSM: this, localMachine: local } satisfies TriggerMeta;
    if (!local) {
      this.rootMachine.processEvent(aEventName, anEv);
    } else {
      this.processEvent(aEventName, anEv);
    }
  }

  // ════════════════════════════════════════════════════════════════════
  //  Sub-machine target checks
  // ════════════════════════════════════════════════════════════════════

  subMachinesRespectTargets(anEvent: string): boolean {
    this._log('subMachinesRespectTargets');
    const stateDef = this._stateDefinition[this.currentState];
    const evtCfg = stateDef[anEvent] as EventConfiguration;
    const targetCfg = evtCfg.next_state_on_target!;
    const condition = targetCfg.condition;
    let result = condition === '||' ? false : true;

    for (const smName in targetCfg.submachines) {
      const smCfg = targetCfg.submachines[smName];
      const delegates = stateDef.delegate_machines!;
      let localRes = smCfg.target_list.indexOf(
        (delegates[smName] as DelegateMachineDeclaration).myFSM!.currentState,
      ) > -1;

      if (smCfg.condition === 'not') localRes = !localRes;

      if (condition === '||') {
        result = result || localRes;
        if (result) return result;
      } else if (condition === '&&') {
        result = result && localRes;
        if (!result) return result;
      } else {
        this._log('unknown operator: ' + condition);
        return result;
      }
    }
    return result;
  }

  // ════════════════════════════════════════════════════════════════════
  //  Utility
  // ════════════════════════════════════════════════════════════════════

  hashCode(source: string): number {
    let hash = 0;
    for (let i = 0; i < source.length; i++) {
      hash = ((hash << 5) - hash) + source.charCodeAt(i);
      hash |= 0;
    }
    return hash;
  }

  // ════════════════════════════════════════════════════════════════════
  //  Logging
  // ════════════════════════════════════════════════════════════════════

  _log(message: string, errorLevel: LogLevel = 3, addOffset?: -1 | 0 | 1): void {
    if (errorLevel >= 2 && !this.opts.debug) return;
    if (errorLevel > this.opts.LogLevel) return;
    if (this.opts.logFSM && !this.opts.logFSM.includes(this.FSMName)) return;

    if (addOffset === -1) {
      this._logOffset = this._logOffset.replace('  ', '');
    }

    const prefix = '[fsm] ' + this._logOffset;
    if (errorLevel === 1) console.error(prefix + message);
    else if (errorLevel === 2) console.warn(prefix + message);
    else console.log(prefix + message);

    if (errorLevel === 1 && this.opts.AlertError) alert(message);
    if (addOffset === 1) this._logOffset += '  ';
  }

  // ════════════════════════════════════════════════════════════════════
  //  Cleanup
  // ════════════════════════════════════════════════════════════════════

  destroy(): void {
    for (const { target, event, handler } of this._boundListeners) {
      target.removeEventListener(event, handler);
    }
    this._boundListeners = [];
    if (this._mutationObserver) {
      this._mutationObserver.disconnect();
      this._mutationObserver = null;
    }
    const id = getElId(this.myUIObject);
    if (id && iFSMRegistry[id]) {
      iFSMRegistry[id] = iFSMRegistry[id].filter((f) => f !== this);
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════
//  Public API functions
// ═══════════════════════════════════════════════════════════════════════

/**
 * Attach a FSM to a DOM element and start it.
 */
export function createFSM<D = unknown>(el: FSMTarget, stateDefinition: StateDefinition<D>, options?: FSMOptions): FSMManager {
  const id = ensureId(el);
  if (!iFSMRegistry[id]) iFSMRegistry[id] = [];

  // The FSM machinery is agnostic to the event-data type `D`; bridge to the
  // internal (unknown-data) StateDefinition.
  const def = stateDefinition as StateDefinition;
  const fsm = new FSMManager(el, def, options);

  const existing = getFSM(el, def);
  if (existing) {
    console.warn('[warn][fsm] state machine was already set for this definition on ' + id);
  }

  iFSMRegistry[id].push(fsm);

  if (options?.initState !== undefined) {
    fsm.InitManager(options.initState);
  } else {
    fsm.InitManager();
  }

  return fsm;
}

/**
 * Attach a FSM to multiple elements.
 */
export function createFSMBatch<D = unknown>(
  elements: NodeListOf<Element> | Element[],
  stateDefinition: StateDefinition<D>,
  options?: FSMOptions,
): FSMManager[] {
  const list = elements instanceof NodeList ? Array.from(elements) : elements;
  return list.map((el) => createFSM(el, stateDefinition, options));
}

/**
 * Retrieve FSM(s) linked to a DOM element.
 */
export function getFSM(el: FSMTarget, stateDefinition?: StateDefinition): FSMManager | FSMManager[] | null {
  const id = getElId(el);
  if (!id || !iFSMRegistry[id]) return stateDefinition ? null : [];

  if (!stateDefinition) return iFSMRegistry[id];

  for (const fsm of iFSMRegistry[id]) {
    if (fsm._originalStateDefinition === stateDefinition) return fsm;
  }
  return null;
}

// ═══════════════════════════════════════════════════════════════════════
//  Default export
// ═══════════════════════════════════════════════════════════════════════

export default { FSMManager, createFSM, createFSMBatch, getFSM };