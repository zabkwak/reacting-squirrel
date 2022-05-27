/* eslint-disable max-classes-per-file */
/** @module Router */

import React from 'react';
import url from 'url';
import RouteParser from 'route-parser';
import qs from 'querystring';

/**
 * Class to work with routes.
 */
class Router {

	/** @type {Object.<string, Route>} */
	_routes = {};

	/**
	 *
	 * @param {Route} route
	 */
	addRoute(route) {
		this._routes[route.spec] = route;
		return this;
	}

	/**
	 * Gets the current route.
	 *
	 * @returns {Route}
	 */
	getRoute() {
		const p = this.parseUrl();
		return this.findRoute(p.path);
	}

	findRoute(path) {
		let route;
		if (path.indexOf('http') === 0) {
			const p = url.parse(path, true);
			path = p.path;
		}
		if (path.lastIndexOf('/') === path.length - 1 && path !== '/') {
			path = path.substr(0, path.length - 1);
		}
		Object.keys(this._routes).forEach((spec) => {
			if (route) {
				return;
			}
			const r = new RouteParser(spec);
			if (r.match(path) === false) {
				return;
			}
			route = this._routes[spec];
		});
		return route || null;
	}

	pushState(path = null, q = {}) {
		const { pathname } = this.parseUrl();
		if (!path) {
			// eslint-disable-next-line no-param-reassign
			path = pathname;
		}
		if (q === null) {
			history.pushState(null, null, path);
			return;
		}
		const s = this.stringifyQuery(q);
		history.pushState(null, null, s ? `${path}${s}` : path);
	}

	stringifyQuery(q = {}) {
		const { query } = this.parseUrl();
		if (q) {
			Object.keys(q).forEach((key) => {
				const value = q[key];
				if (value === undefined) {
					delete query[key];
				} else {
					query[key] = value;
				}
			});
		}
		const s = qs.stringify(query);
		return s ? `?${s}` : null;
	}

	parseUrl(params = false) {
		const p = url.parse(location.href, true);
		if (!params) {
			return p;
		}
		return {
			...p,
			params: this.getParams(),
		};
	}

	getParams() {
		const p = this.parseUrl();
		let params = null;
		Object.keys(this._routes).forEach((spec) => {
			if (params) {
				return;
			}
			const r = new RouteParser(spec);
			const match = r.match(p.path);
			if (match === false) {
				return;
			}
			params = match;
		});
		return params || {};
	}
}

const router = new Router();

class Route {

	/**
	 *
	 * @param {object} route
	 * @param {string} route.spec
	 * @param {JSX.Element} route.component
	 * @param {string} route.title
	 * @param {Object.<string, any>} route.initialData
	 * @param {string} route.layout
	 */
	static create(route) {
		return new this(route.spec, route.component, route.title, route.initialData, route.layout);
	}

	/**
	 *
	 * @param {string} spec
	 * @param {JSX.Element} component
	 * @param {string} title
	 * @param {Object.<string, any>} initialData
	 * @param {string} layout
	 */
	constructor(spec, component, title, initialData = {}, layout = null) {
		this.spec = spec;
		this.component = component;
		this.title = title;
		this.initialData = initialData;
		this.layout = layout;
	}

	getComponent() {
		const { params, query } = router.parseUrl(true);
		return <this.component params={params} query={query} initialData={this.initialData} />;
	}
}

export {
	// eslint-disable-next-line no-restricted-exports
	router as default,
	Route,
};
