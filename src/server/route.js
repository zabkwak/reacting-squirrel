export default class Route {

    method = null;
    spec = null;
    contentComponent = null;
    title = null;
    requiredAuth = false;
    callback = null;

    constructor(method, spec, contentComponent, title, requireAuth = false, callback = null) {
        this.method = method;
        this.spec = spec;
        this.contentComponent = contentComponent;
        this.title = title;
        this.requireAuth = requireAuth;
        this.callback = callback;
    }
}
