/**
 * -----------------------------------------------------------------------------------------
 * INTERSEL - 4 cité d'Hauteville - 75010 PARIS
 * RCS PARIS 488 379 660 - NAF 721Z
 *
 * File : Router.js
 * Router : Gestionnaire de routing pour Blapy V2 avec support Navigo
 *
 * -----------------------------------------------------------------------------------------
 * @copyright Intersel 2015-2025
 * @fileoverview : Router service pour Blapy V2 - compatible avec Sammy de V1 mais utilise Navigo
 * @see {@link https://github.com/intersel/blapy2}
 * @author : Corentin NELHOMME - corentin.nelhomme@intersel.fr
 * @version : 2.0.0
 * @license : DonationWare - see https://github.com/intersel/blapy2/blob/master/LICENSE
 * -----------------------------------------------------------------------------------------
 */

export class Router {

    constructor(logger, blapy, opts = {}) {
        this.logger = logger;
        this.blapy = blapy;
        this.opts = {
            enableRouter: false,
            root: '/',
            hash: false,
            strategy: 'ONE',
            noMatchWarning: false,
            linksSelector: '[data-blapy-link]',
            ...opts
        };

        this.router = null;
        this.isInitialized = false;
    }

    /**
     * Initialise le routeur Navigo
     * Compatible avec l'initialisation Sammy de Blapy V1
     */
    init() {
        this.logger.info('Router initialization starting...', 'router');

        if (!this.opts.enableRouter) {
            this.logger.info('Router disabled, using standard event handlers', 'router');
            this._initStandardHandlers();
            return true;
        }

        if (typeof Navigo !== 'function') {
            this.logger.error("Navigo is not loaded... can not continue", 'router');
            alert("Navigo is not loaded... can not continue");
            return false;
        }

        this._initNavigoRouter();
        return true;
    }

    /**
     * Initialise les gestionnaires d'événements standard (sans routeur)
     * Équivalent au mode "no routing" de Blapy V1
     */
    _initStandardHandlers() {
        this.logger.info('Initializing standard event handlers (no routing)', 'router');

        const container = this.blapy.container;

        container.addEventListener('click', (event) => {
            const link = event.target.closest('a[data-blapy-link]');
            if (!link) return;

            const activeId = link.getAttribute('data-blapy-active-blapyid');
            if (activeId && activeId !== this.blapy.myUIObjectID) {
                return;
            }

            event.preventDefault();

            const params = this._extractLinkParams(link);
            const embeddingBlockId = link.getAttribute('data-blapy-embedding-blockid');

            if (embeddingBlockId) {
                params.embeddingBlockId = embeddingBlockId;
            }

            this.logger.info(`Standard link clicked: ${link.href}`, 'router');

            this.blapy.myFSM.trigger('postData', {
                aUrl: this._extractUrl(link.href),
                params: params,
                method: link.getAttribute('method') || 'GET',
                aObjectId: this.blapy.myUIObjectID,
                noBlapyData: link.getAttribute('data-blapy-noblapydata')
            });
        });

        container.addEventListener('submit', (event) => {
            const form = event.target;

            if (!form.matches('form[data-blapy-link]')) return;

            const activeId = form.getAttribute('data-blapy-active-blapyid');
            if (activeId && activeId !== this.blapy.myUIObjectID) {
                return;
            }

            console.log("test")

            event.preventDefault();

            this.logger.info(`Form submitted: ${form.action}`, 'router');

            console.log(form)

            const formData = this._extractFormData(form, event);

            const embeddingBlockId = form.getAttribute('data-blapy-embedding-blockid');
            if (embeddingBlockId) {
                formData.embeddingBlockId = embeddingBlockId;
            }

            this.blapy.myFSM.trigger('postData', {
                aUrl: this._extractUrl(form.action),
                params: formData,
                method: form.getAttribute('method') || 'POST',
                aObjectId: this.blapy.myUIObjectID,
                noBlapyData: form.getAttribute('data-blapy-noblapydata')
            });
        });
    }

    /**
     * Initialise le routeur Navigo
     * Compatible avec l'initialisation Sammy de Blapy V1
     */
    _initNavigoRouter() {
        this.logger.info('Initializing simple router (manual history management)', 'router');

        this._interceptBlapyLinks();

        window.addEventListener('popstate', (event) => {
            this.logger.info('Popstate event detected', 'router');

            this.blapy.myFSM.trigger('loadUrl', {
                aUrl: window.location.pathname + window.location.search,
                params: {},
                aObjectId: this.blapy.myUIObjectID
            });
        });

        this.isInitialized = true;
        this.logger.info('Simple router initialized', 'router');
    }

    /**
     * Gère les liens Blapy avec Navigo
     * Équivalent aux gestionnaires sammy.get/post/put de Blapy V1
     */
    _handleBlapyLink(match, method = 'GET') {
        const url = match.url || match.route.path;

        this.logger.info(`Navigo route matched: ${method} ${url}`, 'router');

        const target = document.querySelector(`[href="${url}"], [action="${url}"]`);
        if (target) {
            const activeId = target.getAttribute('data-blapy-active-blapyid');
            if (activeId && activeId !== this.blapy.myUIObjectID) {
                this.logger.info(`Route filtered - not for this Blapy instance: ${activeId}`, 'router');
                return;
            }
        }

        const embeddingBlockId = this._extractEmbeddingBlockId(url);

        const params = {
            ...match.params,
            ...(match.data || {})
        };

        if (embeddingBlockId) {
            params.embeddingBlockId = embeddingBlockId;
        }

        const cleanUrl = this._cleanBlapyUrl(url);

        if (method === 'GET') {
            this.blapy.myFSM.trigger('loadUrl', {
                aUrl: cleanUrl,
                params: this._filterAttributes(params),
                aObjectId: this.blapy.myUIObjectID,
                noBlapyData: target?.getAttribute('data-blapy-noblapydata')
            });
        } else {
            this.blapy.myFSM.trigger('postData', {
                aUrl: cleanUrl,
                params: this._filterAttributes(params),
                aObjectId: this.blapy.myUIObjectID,
                method: method.toLowerCase(),
                noBlapyData: target?.getAttribute('data-blapy-noblapydata')
            });
        }
    }

    /**
     * Extrait l'embeddingBlockId de l'URL
     * Équivalent à extractembeddingBlockIdName de Blapy V1
     */
    _extractEmbeddingBlockId(url) {
        const regex = /#blapylink#(.*)/i;
        const match = regex.exec(url);
        return match && match[1] ? match[1] : '';
    }

    /**
     * Nettoie l'URL en retirant les parties #blapylink
     */
    _cleanBlapyUrl(url) {
        return url.replace(/#blapylink.*$/, '');
    }

    /**
     * Filtre les attributs pour ne garder que les valeurs utiles
     * Équivalent à filterAttributes de Blapy V1
     */
    _filterAttributes(params) {
        const filtered = {};

        for (const [key, value] of Object.entries(params)) {
            if (typeof value !== 'function' && typeof value !== 'object') {
                filtered[key] = value;
            }
        }

        return filtered;
    }

    /**
     * Extrait les paramètres d'un lien
     */
    _extractLinkParams(link) {
        const paramsAttr = link.getAttribute('data-blapy-params');
        if (!paramsAttr) return {};

        try {
            const jsonParser = typeof JSON5 !== 'undefined' ? JSON5 : JSON;
            return jsonParser.parse(paramsAttr);
        } catch (e) {
            this.logger.warn(`Failed to parse link params: ${paramsAttr}`, 'router');
            return {};
        }
    }

    /**
     * Extrait les données d'un formulaire
     */
    _extractFormData(form, event) {
        const formData = new FormData(form);
        const data = {};

        for (const [key, value] of formData.entries()) {
            data[key] = value;
        }

        if (event.submitter) {
            const submitter = event.submitter;
            if (submitter.name) {
                data[submitter.name] = submitter.value || '';
            }
        } else if (event.originalEvent && event.originalEvent.submitter) {
            const submitter = event.originalEvent.submitter;
            if (submitter.name) {
                data[submitter.name] = submitter.value || '';
            }
        }

        return data;
    }

    /**
     * Extrait l'URL propre (sans hash)
     */
    _extractUrl(fullUrl) {
        console.log(fullUrl)
        if (!fullUrl) return window.location.href;

        const hashIndex = fullUrl.indexOf('#');
        return hashIndex !== -1 ? fullUrl.substring(0, hashIndex) : fullUrl;
    }

    /**
     * Navigation programmatique
     * Équivalent aux méthodes de navigation de Blapy V1
     */
    navigate(url, options = {}) {
        if (!this.isInitialized || !this.router) {
            this.logger.warn('Router not initialized, cannot navigate', 'router');
            return;
        }

        this.logger.info(`Navigating to: ${url}`, 'router');

        const navigateOptions = {
            title: options.title,
            stateObj: options.stateObj,
            historyAPIMethod: options.historyAPIMethod || 'pushState',
            updateBrowserURL: options.updateBrowserURL !== false,
            callHandler: options.callHandler !== false,
            callHooks: options.callHooks !== false,
            updateState: options.updateState !== false,
            force: options.force || false
        };

        this.router.navigate(url, navigateOptions);
    }

    /**
     * Résolution d'une route sans navigation
     */
    resolve(path) {
        if (!this.isInitialized || !this.router) {
            this.logger.warn('Router not initialized, cannot resolve', 'router');
            return false;
        }

        return this.router.resolve(path);
    }

    /**
     * Destruction du routeur
     */
    destroy() {
        if (this.router) {
            this.router.destroy();
            this.router = null;
            this.isInitialized = false;
            this.logger.info('Router destroyed', 'router');
        }
    }

    _interceptBlapyLinks() {
        const container = this.blapy.container;

        container.addEventListener('click', (event) => {
            const link = event.target.closest('a[data-blapy-link]');
            if (!link) return;

            const href = link.getAttribute('href');
            if (!href || !href.includes('#blapylink')) return;

            const activeId = link.getAttribute('data-blapy-active-blapyid');
            if (activeId && activeId !== this.blapy.myUIObjectID) return;

            event.preventDefault();

            const params = this._extractLinkParams(link);
            const embeddingBlockId = this._extractEmbeddingBlockId(href);

            if (embeddingBlockId) {
                params.embeddingBlockId = embeddingBlockId;
            }

            const cleanUrl = this._cleanBlapyUrl(href);

            window.history.pushState({ blapy: true }, '', cleanUrl);

            this.logger.info(`Navigating to: ${cleanUrl}`, 'router');

            this.blapy.myFSM.trigger('loadUrl', {
                aUrl: cleanUrl,
                params: this._filterAttributes(params),
                aObjectId: this.blapy.myUIObjectID,
                noBlapyData: link.getAttribute('data-blapy-noblapydata')
            });
        });
    }
}