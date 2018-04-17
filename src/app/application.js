import ReactDOM from 'react-dom';

import Router, { Route } from './router';
import Socket from './socket';

// TODO popstate listener

class Application {

    _content = null;
    _title = null;
    _initialData = {};

    get DEV() {
        return this._initialData.dev;
    }

    constructor() {
        this._content = document.getElementById('content');
        this._title = document.getElementsByTagName('title')[0];
        this._initialData = JSON.parse(document.getElementById('initial-data').getAttribute('data'));
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

    start(routingMap) {
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
