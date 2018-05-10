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
     */
    getRoute() {
        const p = this.parseUrl();
        let route;
        let params = {};
        Object.keys(this._routes).forEach((spec) => {
            const r = new RouteParser(spec);
            const match = r.match(p.path);
            if (match === false) {
                return;
            }
            route = this._routes[spec];
            params = match;
        });

        if (!route) {
            return null;
        }
        route.params = params;
        route.query = p.query;
        route.href = p.href;
        route.pathname = p.pathname;
        return route;
    }

    pushState(path = null, q = {}) {
        const { query, pathname } = this.getRoute();
        if (!path) {
            path = pathname;
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

    parseUrl() {
        return url.parse(location.href, true);
    }
}

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
        return <this.component params={this.params} query={this.query} initialData={this.initialData} />;
    }
}

const router = new Router();
export {
    router as default,
    Route,
};
