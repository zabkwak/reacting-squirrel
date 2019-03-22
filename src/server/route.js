/**
 * Route for the the routing maps.
 */
export default class Route {

    /**
     * HTTP method of the route.
     * @type {'get'|'post'|'put'|'delete'}
     */
    method = null;

    /**
     * Route spec.
     * @type {string}
     */
    spec = null;

    /**
     * Relative path from the app directory to the component.
     * @type {string}
     */
    contentComponent = null;

    /**
     * Title of the page.
     * @type {string}
     */
    title = null;

    /**
     * If true the route requires authorized user.
     * @type {boolean}
     */
    requireAuth = false;

    /**
     * Callback to call when the route is called.
     * @type {function}
     */
    callback = null;

    /**
     *
     * @param {'get'|'post'|'put'|'delete'} method HTTP method of the route.
     * @param {string} spec Route spec.
     * @param {string} contentComponent Relative path from the {config.appDir} to the component.
     * @param {string} title Title of the page.
     * @param {boolean} requireAuth If true the route requires authorized user.
     * @param {function=} callback Callback to call when the route is called.
     */
    constructor(method, spec, contentComponent, title, requireAuth = false, callback = null) {
        this.method = method;
        this.spec = spec;
        this.contentComponent = contentComponent;
        this.title = title;
        this.requireAuth = requireAuth;
        this.callback = callback;
    }
}
