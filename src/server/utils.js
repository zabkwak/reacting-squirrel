/* eslint-disable import/no-dynamic-require */
/* eslint-disable global-require */
import fs from 'fs';

import SocketClass from './socket-class';

/**
 * @typedef {import('./').default} Server
 * @typedef Route
 * @property {'get'|'post'|'put'|'delete'} method Http method of the route.
 * @property {string} route Route of the page.
 * @property {string} component Relative path to the Page component from the application directory.
 * @property {string} title Title of the page.
 * @property {boolean} requireAuth If true the page requires logged user.
 * @typedef Component
 * @property {string} id Element id in the rendered html.
 * @property {string} component Relative path to the component from the application directory.
 */

export default {
    /**
     * Registers socket classes to the server app.
     *
     * @param {Server} app Server instance.
     * @param {string} dir Relative path to the directory with socket classes.
     */
    registerSocketClassDir(app, dir) {
        const files = fs.readdirSync(dir);
        files.forEach((file) => {
            const path = `${dir}/${file}`;
            const stat = fs.statSync(path);
            if (stat.isDirectory()) {
                this.registerSocketClassDir(app, path);
                return;
            }
            const m = require(path);
            const Class = m.default || m;
            if (this._isConstructor(Class) && new Class() instanceof SocketClass) {
                app.registerSocketClass(Class);
            }
        });
    },
    /**
     * Registers routes to the server app.
     *
     * @param {Server} app Server instance.
     * @param {Array<Route>} routes List of routes to register.
     */
    registerRoutes(app, routes) {
        routes.forEach(({
            method, route, component, title, requireAuth,
        }) => {
            app.registerRoute(method || 'get', route, component, title, requireAuth);
        });
    },
    /**
     * Registers components to the server app.
     *
     * @param {Server} app Server instance.
     * @param {Array<Component>} components List of components to register.
     */
    registerComponents(app, components) {
        components.forEach(({ id, component }) => {
            app.registerComponent(component, id);
        });
    },
    _isConstructor(Class) {
        try {
            // eslint-disable-next-line no-new
            new Class();
            return true;
        } catch (e) {
            return false;
        }
    },
};
