import React from 'react';
import { createRoot } from 'react-dom/client';
import Text from 'texting-squirrel';
import Cookies from 'universal-cookie';

import CallbackEmitter from './callback-emitter';
import Router, { Route } from './router';
// eslint-disable-next-line import/no-cycle
import ErrorHandler from './components/error-handler';

/**
 * Base class for client application context.
 */
class Application extends CallbackEmitter {
	LOCALE_COOKIE_NAME = 'rs~locale';

	_container = null;

	_content = null;

	_title = null;

	_initialData = {};

	_started = false;

	_components = [];

	_refs = {};

	_errorPage = null;

	_cookies = new Cookies();

	_provider = null;

	_errorHandler = null;

	_locale = 'default';

	_locales = [];

	_defaultLocale = null;

	_roots = {};

	/**
	 * @returns {boolean}
	 */
	get DEV() {
		return Boolean(this._initialData.dev);
	}

	/**
	 * @returns {any}
	 * @deprecated
	 */
	get initialData() {
		this.logWarning('Getting initialData from the context is deprecated. Use getInitialData method.');
		return this._initialData;
	}

	constructor() {
		super();
		this._container = document.getElementById('container');
		this._content = document.getElementById('content');
		[this._title] = document.getElementsByTagName('title');
		const initialDataElement = document.getElementById('initial-data');
		if (initialDataElement) {
			this._initialData = JSON.parse(initialDataElement.getAttribute('data'));
		}
		if (!this._container) {
			this.logWarning('Container wrapper not found');
		}
		if (!this._content) {
			this.logError('Content wrapper not found');
		}
		window.onpopstate = (event) => {
			this.render(Router.getRoute());
			this._callListener('popstate', event);
		};
	}

	/**
	 * Gets the initial data.
	 *
	 * @param {string?} key
	 *
	 * @returns {any}
	 */
	getInitialData(key = null) {
		if (key) {
			return this._initialData[key];
		}
		return this._initialData;
	}

	getLocaleCode() {
		return this._locale === 'default' ? this._defaultLocale : this._locale;
	}

	getLocale() {
		return this._locale;
	}

	getDefaultLocale() {
		return this._defaultLocale;
	}

	getLocales() {
		return this._locales;
	}

	getTitle() {
		return this._title.textContent;
	}

	/**
	 * Gets the reference of the component in the application context.
	 *
	 * @param {string} key Key of the reference in the application context.
	 */
	getRef(key) {
		return this._refs[key];
	}

	getCookie(name) {
		return this._cookies.get(name);
	}

	// #region Registers

	/**
	 * Registers the map of routes to the Router.
	 *
	 * @param {*} routingMap
	 */
	registerRoutingMap(routingMap) {
		this._checkStartedState();
		routingMap.forEach((route) => {
			Router.addRoute(Route.create({ ...route, initialData: this._initialData }));
		});
		return this;
	}

	/**
	 * Registers custom components to render after the start.
	 *
	 * @param {any[]} components
	 */
	registerComponents(components) {
		this._checkStartedState();
		this._components = components;
		return this;
	}

	registerErrorPage(errorPage) {
		this._checkStartedState();
		this._errorPage = errorPage;
		return this;
	}

	registerComponentProvider(provider) {
		this._checkStartedState();
		this._provider = provider;
		return this;
	}

	registerErrorHandler(errorHandler) {
		this._checkStartedState();
		this._errorHandler = errorHandler;
		return this;
	}

	registerLocales(defaultLocale, accepted) {
		this._defaultLocale = defaultLocale;
		this._locales = accepted;
		return this;
	}

	// #endregion

	/**
	 * Starts the application. The application can be started only once.
	 */
	start() {
		this._checkStartedState();
		this._registerLayoutNavigationListener();
		this._started = true;
		this.logInfo('Application started', {
			DEV: this.DEV,
			timestamp: this.getInitialData('timestamp'),
			version: this.getInitialData('version'),
		});
		this._callListener('start');
		this._renderRegisteredComponents();
		this.render(Router.getRoute());
	}

	// #region Renderers

	refresh() {
		this.refreshContent();
		this.refreshComponents();
	}

	/**
	 * Refreshes the content. Content DOM is cleared and the current Page is rendered.
	 */
	refreshContent() {
		this.render(Router.getRoute(), true);
		this._callListener('refresh');
	}

	refreshComponents() {
		this._renderRegisteredComponents(true);
	}

	/**
	 * Renders the route's page in the content element.
	 *
	 * @param {Route} route
	 * @param {boolean} refresh
	 */
	render(route, refresh = false) {
		if (this._initialData.error) {
			const { error } = this._initialData;
			delete this._initialData.error;
			const p = Router.parseUrl();
			if (!this._errorPage) {
				this.logError('Error Page not registered');
				return;
			}
			this.renderComponent(
				<this._errorPage error={error} initialData={this._initialData} params={{}} query={p.query} />,
				this._content,
			);
			return;
		}
		if (!route) {
			if (!this._initialData.error) {
				location.reload(true);
				return;
			}
			return;
		}
		if (route.title) {
			this.setTitle(route.title.indexOf(':') === 0 ? Text.get(route.title.substr(1)) : route.title);
		}
		if (refresh) {
			this._unmountRoot(this._content);
		}
		this.renderPage(route.getComponent());
	}

	renderPage(page) {
		this.renderComponent(page, this._content);
	}

	/**
	 * Renders React component to the HTML element.
	 *
	 * @param {JSX.Element} component
	 * @param {HTMLElement} target
	 * @param {function} callback
	 */
	renderComponent(component, target, callback) {
		const Provider = this._provider || React.Fragment;
		const EH = this._errorHandler || ErrorHandler;
		const root = this._getRoot(target);
		root.render(
			<EH>
				<Provider>{component}</Provider>
			</EH>,
			callback,
		);
	}

	// #endregion

	// #region Navigators

	/**
	 * Pushes the state to the history and forces to render the content.
	 *
	 * @param {string} path
	 * @param {Object.<string, string>} q
	 */
	redirect(path, q) {
		this.navigate(path, q, true);
	}

	/**
	 * Pushes the state to the history and renders the route if it's not the actual route and refresh is false.
	 *
	 * @param {string} path
	 * @param {Object.<string, string>} q
	 * @param {boolean} refresh
	 */
	navigate(path, q, refresh = false) {
		const r = Router.getRoute();
		const route = Router.findRoute(path);
		if (route && r && r.layout === route.layout) {
			this.pushState(path, q);
			this.render(Router.getRoute(), refresh);
			return;
		}
		const s = Router.stringifyQuery(q);
		location.href = s ? `${path}${s}` : path;
	}

	/**
	 * Pushes the state to the history.
	 *
	 * @param {string} path
	 * @param {Object.<string, string>} q
	 */
	pushState(path, q) {
		Router.pushState(path, q);
	}

	// #endregion

	// #region Setters

	/**
	 * Updates the page title in the HTML header.
	 *
	 * @param {string} title
	 */
	setTitle(title) {
		this._title.textContent = title;
	}

	setLocale(locale) {
		if (locale === this._defaultLocale) {
			// eslint-disable-next-line no-param-reassign
			locale = 'default';
		}
		if (Text.getDictionary(locale)) {
			Text.setDictionary(locale);
			const expires = new Date();
			expires.setFullYear(expires.getFullYear() + 1);
			this.setCookie(this.LOCALE_COOKIE_NAME, locale, { expires });
			this._locale = locale;
			this._callListener('locale.set', locale);
		} else {
			this.logWarning(`Locale ${locale} dictionary not registered.`);
		}
	}

	/**
	 * Sets the reference of the component to the application context.
	 *
	 * @param {any} ref Reference of the component.
	 * @param {string} key Key of the reference in the application context.
	 */
	setRef(ref, key) {
		this._refs[key] = ref;
	}

	setCookie(name, value, options = {}) {
		this._cookies.set(name, value, {
			path: '/',
			// httpOnly: true,
			secure: location.protocol === 'https:',
			...options,
		});
	}

	// #endregion

	logInfo(message, ...optionalParams) {
		if (this.DEV) {
			// eslint-disable-next-line no-console
			console.log(message, ...optionalParams);
		}
		// eslint-disable-next-line object-curly-newline
		this._callListener('log', { severity: 'info', message, component: false, args: optionalParams });
	}

	logWarning(message, ...optionalParams) {
		if (this.DEV) {
			// eslint-disable-next-line no-console
			console.warn(message, ...optionalParams);
		}
		// eslint-disable-next-line object-curly-newline
		this._callListener('log', { severity: 'warn', message, component: false, args: optionalParams });
	}

	logError(message, ...optionalParams) {
		if (this.DEV) {
			// eslint-disable-next-line no-console
			console.error(message, ...optionalParams);
		}
		// eslint-disable-next-line object-curly-newline
		this._callListener('log', { severity: 'error', message, component: false, args: optionalParams });
	}

	logComponentError(message, ...optionalParams) {
		if (this.DEV) {
			// eslint-disable-next-line no-console
			console.error(message, ...optionalParams);
		}
		// eslint-disable-next-line object-curly-newline
		this._callListener('log', { severity: 'error', message, component: true, args: optionalParams });
	}

	_renderRegisteredComponents(refresh = false) {
		this._components.forEach((component) => {
			const target = document.getElementById(component.elementId);
			if (!target) {
				this.logWarning(`Target DOM element with id '${component.elementId}' doesn't exist.`);
				return;
			}
			if (refresh) {
				this._unmountRoot(target);
			}
			const Component = component.component;
			this.renderComponent(<Component ref={(ref) => this.setRef(ref, component.elementId)} />, target);
		});
	}

	_registerLayoutNavigationListener() {
		Array.from(document.querySelectorAll('.ssr-nav')).forEach((element) => {
			element.addEventListener('click', (e) => {
				e.preventDefault();
				const { href } = e.currentTarget;
				this.navigate(href);
			});
		});
	}

	_checkStartedState() {
		if (this._started) {
			throw new Error('Application already started');
		}
	}

	_unmountRoot(target) {
		const root = this._getRoot(target);
		root.unmount();
		delete this._roots[target.id];
	}

	_getRoot(target) {
		if (!this._roots[target.id]) {
			this._roots[target.id] = createRoot(target);
		}
		return this._roots[target.id];
	}
}

export default new Application();
