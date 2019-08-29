import ReactDOM from 'react-dom';
import React from 'react';

import Router, { Route } from './router';
import CallbackEmitter from './callback-emitter';
import ErrorPage from './page.error';

/**
 * Base class for client application context.
 */
class Application extends CallbackEmitter {

	_container = null;

	_content = null;

	_title = null;

	_initialData = {};

	_started = false;

	_components = [];

	_refs = {};

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
		console.warn('Getting initialData from the context is deprecated. Use getInitialData method.');
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
			console.warn('Container wrapper not found');
		}
		if (!this._content) {
			console.error('Content wrapper not found');
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

	/**
	 * Starts the application. The application can be started only once.
	 */
	start() {
		this._checkStartedState();
		this._started = true;
		if (this.DEV) {
			console.log('Application started', {
				DEV: this.DEV, timestamp: this.getInitialData('timestamp'), version: this.getInitialData('version'),
			});
		}
		this._callListener('start');
		this._components.forEach((component) => {
			const target = document.getElementById(component.elementId);
			if (!target) {
				if (this.DEV) {
					console.warn(`Target DOM element with id '${component.elementId}' doesn't exist.`);
				}
				return;
			}
			const Component = component.component;
			this.renderComponent(<Component ref={ref => this.setRef(ref, component.elementId)} />, target);
		});
		this.render(Router.getRoute());
	}

	/**
	 * Refreshes the content. Content DOM is cleared and the current Page is rendered.
	 */
	refreshContent() {
		this.render(Router.getRoute(), true);
		this._callListener('refresh');
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
			this.renderComponent(
				<ErrorPage error={error} initialData={this._initialData} params={{}} query={p.query} />,
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
		this.setTitle(route.title);
		if (refresh) {
			ReactDOM.unmountComponentAtNode(this._content);
		}
		const page = route.getComponent();
		this.renderComponent(page, this._content, () => this._callListener('pagerender', page));
	}

	/**
	 * Renders React component to the HTML element.
	 *
	 * @param {JSX.Element} component
	 * @param {HTMLElement} target
	 * @param {function} callback
	 */
	renderComponent(component, target, callback = () => { }) {
		ReactDOM.render(component, target, callback);
	}

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
		this.pushState(path, q);
		this.render(Router.getRoute(), refresh);
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

	/**
	 * Updates the page title in the HTML header.
	 *
	 * @param {string} title
	 */
	setTitle(title) {
		this._title.textContent = title;
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

	/**
	 * Gets the reference of the component in the application context.
	 *
	 * @param {string} key Key of the reference in the application context.
	 */
	getRef(key) {
		return this._refs[key];
	}

	_checkStartedState() {
		if (this._started) {
			throw new Error('Application already started');
		}
	}
}

export default new Application();
