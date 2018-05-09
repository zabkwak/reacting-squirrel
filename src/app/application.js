import ReactDOM from 'react-dom';

import Router, { Route } from './router';
import Socket from './socket';
import CallbackEmitter from './callback-emitter';

/**
 * Base class for client application context.
 */
class Application extends CallbackEmitter {

    _container = null;
    _content = null;
    _title = null;
    _initialData = {};
    _started = false;

    get DEV() {
        return this._initialData.dev;
    }

    constructor() {
        super();
        this._container = document.getElementById('container');
        this._content = document.getElementById('content');
        [this._title] = document.getElementsByTagName('title');
        this._initialData = JSON.parse(document.getElementById('initial-data').getAttribute('data'));
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

    registerRoutingMap(routingMap) {
        routingMap.forEach((route) => {
            Router.addRoute(Route.create({ ...route, initialData: this._initialData }));
        });
        return this;
    }

    registerSocketEvents(events) {
        Socket.registerEvents(events);
        return this;
    }

    start() {
        if (this._started) {
            throw new Error('Application already started');
        }
        this._started = true;
        console.log('Application started', { DEV: this.DEV });
        this.render(Router.getRoute());
        Socket.connect();
    }

    refreshContent() {
        this.render(Router.getRoute(), true);
        this._callListener('refresh');
    }

    render(route, refresh = false) {
        this.setTitle(route.title);
        if (refresh) {
            this._content.removeChild(this._content.firstChild);
        }
        this.renderComponent(route.getComponent(), this._content);
    }

    /**
     * Renders React component to the HTML element.
     *
     * @param {JSX.Element} component
     * @param {HTMLElement} target
     */
    renderComponent(component, target) {
        ReactDOM.render(component, target);
    }

    /**
     * Pushes the state to the history and refreshes content.
     *
     * @param {string} path
     * @param {Object.<string, string>} q
     */
    redirect(path, q) {
        this.pushState(path, q);
        this.refreshContent();
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
}

export default new Application();
