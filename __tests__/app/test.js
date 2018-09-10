import React from 'react';

import { Component } from '../../src/app';

export default class Test extends Component {

    render() {
        return <h3>{this.getText('header')}</h3>;
    }
}
