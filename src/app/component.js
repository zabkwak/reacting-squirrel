import { Component as Base } from 'react';

import Application from './application';

export default class Component extends Base {

    __popState__ = (application, event) => {
        this.onPopState(event);
    }

    componentDidMount() {
        this.getContext().addListener('popstate', this.__popState__);
    }

    componentWillUnmount() {
        this.getContext().removeListener('popstate', this.__popState__);
    }

    getContext() {
        return Application;
    }

    onPopState(event) { }

}
