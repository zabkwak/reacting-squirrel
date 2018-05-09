import { Component as Base } from 'react';

import Application from './application';

/**
 * Base application React Component. It registeres window.onpopstate event for updates of the component's states.
 */
export default class Component extends Base {

    /**
     * The listener on popstate event of the application.
     *
     * @param {Application} application
     * @param {*} event
     * @private
     */
    __popState__ = (application, event) => {
        this.onPopState(event);
    }

    componentDidMount() {
        this.getContext().addListener('popstate', this.__popState__);
    }

    componentWillUnmount() {
        this.getContext().removeListener('popstate', this.__popState__);
    }

    /**
     * Gets the application context.
     */
    getContext() {
        return Application;
    }

    /**
     * Method called after the window.onpopstate event.
     *
     * @param {*} event
     */
    onPopState(event) { }

}
