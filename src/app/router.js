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
		let route;
		Object.keys(this._routes).forEach((spec) => {
			if (route) {
				return;
			}
			const r = new RouteParser(spec);
			const match = r.match(p.path);
			if (match === false) {
				return;
			}
			route = this._routes[spec];
		});

		return route || null;
	}

	pushState(path = null, q = {}) {
		const { query, pathname } = this.parseUrl();
		if (!path) {
			// eslint-disable-next-line no-param-reassign
			path = pathname;
		}
		if (q === null) {
			history.pushState(null, null, path);
			return;
		}
		Object.keys(q).forEach((key) => {
			const value = q[key];
			if (value === undefined) {
				delete query[key];
			} else {
				query[key] = value;
			}
		});
		const s = qs.stringify(query);
		history.pushState(null, null, s ? `${path}?${s}` : path);
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
	 */
	static create(route) {
		return new this(route.spec, route.component, route.title, route.initialData);
	}

	/**
	 *
	 * @param {string} spec
	 * @param {JSX.Element} component
	 * @param {string} title
	 * @param {Object.<string, any>} initialData
	 */
	constructor(spec, component, title, initialData = {}) {
		this.spec = spec;
		this.component = component;
		this.title = title;
		this.initialData = initialData;
	}

	getComponent() {
		const { params, query } = router.parseUrl(true);
		return <this.component params={params} query={query} initialData={this.initialData} />;
	}
}

export {
	router as default,
	Route,
};
