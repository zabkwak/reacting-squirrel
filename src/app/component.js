import { Component as Base } from 'react';

import Application from './application';

export default class Component extends Base {

    getContext() {
        return Application;
    }

}
