import * as React from 'react';

import { Page } from '../../src/app';

import TSComponent from './ts-component';

export default class About extends Page {

    async componentDidMount() {
        super.componentDidMount();
        console.log(await this.call('user.get'));
    }

    render() {
        return (
            <div className="about-wrapper">
                <h1>About 3</h1>
                <TSComponent />
            </div>
        );
    }
}
